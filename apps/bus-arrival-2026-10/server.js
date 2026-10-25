// 의존성 없는 Node 서버: 정적 파일 제공 + 버스 API 프록시.
// 공공데이터 API 는 브라우저에서 직접 호출하면 CORS 에 막히고 인증키도 노출되므로 서버를 거친다.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ApiError, seoulProvider, gyeonggiProvider, mockProvider, normalizeRoute,
} from './lib/providers.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
loadDotEnv(path.join(ROOT, '.env'));

const PORT = Number(process.env.PORT) || 3000;
const MOCK = process.env.MOCK === '1';
const CACHE_MS = 15_000;

function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

export function buildProviders(env = process.env, { mock = env.MOCK === '1', fetchImpl } = {}) {
  if (mock) return { seoul: mockProvider('seoul', '서울'), gyeonggi: mockProvider('gyeonggi', '경기') };
  const shared = env.DATA_GO_KR_SERVICE_KEY;
  const providers = {};
  const seoulKey = env.SEOUL_SERVICE_KEY || shared;
  const gyeonggiKey = env.GYEONGGI_SERVICE_KEY || shared;
  if (seoulKey) providers.seoul = seoulProvider({ serviceKey: seoulKey, fetchImpl });
  if (gyeonggiKey) providers.gyeonggi = gyeonggiProvider({ serviceKey: gyeonggiKey, fetchImpl });
  return providers;
}

export function createHandler(providers) {
  const cache = new Map();

  async function arrivals(region, stop, bus) {
    const provider = providers[region];
    if (!provider) throw new ApiError(`'${region}' 지역은 인증키가 설정되지 않았습니다.`, 400);
    if (!/^\d{4,6}$/.test(stop)) throw new ApiError('정류장 번호는 숫자 4~6자리로 입력해 주세요.', 400);

    const cacheKey = `${region}:${stop}`;
    let entry = cache.get(cacheKey);
    if (!entry || Date.now() - entry.at > CACHE_MS) {
      entry = { at: Date.now(), data: await provider.getArrivals(stop) };
      cache.set(cacheKey, entry);
    }

    const wanted = bus ? normalizeRoute(bus) : null;
    const list = wanted
      ? entry.data.arrivals.filter((a) => normalizeRoute(a.route) === wanted)
      : entry.data.arrivals;
    return {
      region,
      station: entry.data.station,
      fetchedAt: new Date(entry.at).toISOString(),
      // 캐시된 동안 흐른 시간만큼 남은 시간을 줄여서 내려준다
      arrivals: list.map((a) => ({
        ...a,
        buses: a.buses.map((b) => ({
          ...b,
          etaSeconds: b.etaSeconds == null ? null : Math.max(0, b.etaSeconds - Math.floor((Date.now() - entry.at) / 1000)),
        })),
      })).sort((x, y) => (x.buses[0]?.etaSeconds ?? Infinity) - (y.buses[0]?.etaSeconds ?? Infinity)),
      routeFound: wanted ? list.length > 0 : null,
      availableRoutes: wanted && list.length === 0 ? entry.data.arrivals.map((a) => a.route) : undefined,
    };
  }

  return async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/api/regions') {
        return sendJson(res, 200, {
          regions: Object.values(providers).map((p) => ({ id: p.id, name: p.name })),
        });
      }
      if (url.pathname === '/api/arrivals') {
        const region = url.searchParams.get('region') ?? '';
        const stop = (url.searchParams.get('stop') ?? '').replace(/\D/g, '');
        const bus = (url.searchParams.get('bus') ?? '').trim();
        return sendJson(res, 200, await arrivals(region, stop, bus));
      }
      if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });
      return serveStatic(url.pathname, res);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 500;
      if (!(err instanceof ApiError)) console.error(err);
      return sendJson(res, status, { error: err instanceof ApiError ? err.message : '서버 내부 오류' });
    }
  };
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/manifest+json',
  '.svg': 'image/svg+xml',
};

async function serveStatic(pathname, res) {
  const publicDir = path.join(ROOT, 'public');
  const file = path.normalize(path.join(publicDir, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(publicDir + path.sep)) return sendJson(res, 403, { error: 'Forbidden' });
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    sendJson(res, 404, { error: 'Not Found' });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const providers = buildProviders(process.env, { mock: MOCK });
  if (Object.keys(providers).length === 0) {
    console.error('인증키가 없습니다. .env 에 SEOUL_SERVICE_KEY / GYEONGGI_SERVICE_KEY 를 넣거나, `npm run mock` 으로 가짜 데이터 모드를 실행하세요.');
    process.exit(1);
  }
  http.createServer(createHandler(providers)).listen(PORT, () => {
    console.log(`🚌 http://localhost:${PORT}  (지역: ${Object.values(providers).map((p) => p.name).join(', ')})`);
  });
}

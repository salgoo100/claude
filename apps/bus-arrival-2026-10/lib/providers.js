// 지역별 버스 도착정보 API 어댑터.
// 각 provider 는 정류장 번호(ARS 번호/모바일 번호)를 받아 아래 형태로 정규화해 돌려준다.
//
// {
//   station: { id, number, name },
//   arrivals: [{ route, direction, buses: [{ etaSeconds, message, stopsAway, plate, seats }] }]
// }

export class ApiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

// data.go.kr 키는 Encoding(이미 % 인코딩됨) / Decoding(원문) 두 가지로 발급된다.
// 어느 쪽을 넣어도 동작하도록, % 가 들어 있으면 이미 인코딩된 것으로 보고 그대로 쓴다.
export function encodeServiceKey(key) {
  return /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
}

export function normalizeRoute(name) {
  return String(name ?? '').replace(/[\s-]/g, '').toUpperCase();
}

function toList(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchJson(url, fetchImpl) {
  let res;
  try {
    res = await fetchImpl(url, { signal: AbortSignal.timeout(8000) });
  } catch (err) {
    throw new ApiError(`버스 정보 서버에 연결하지 못했습니다 (${err.name === 'TimeoutError' ? '시간 초과' : err.message})`);
  }
  const text = await res.text();
  if (!res.ok) throw new ApiError(`버스 정보 서버 오류 (HTTP ${res.status})`);
  try {
    return JSON.parse(text);
  } catch {
    // 인증키 오류 등은 JSON 대신 XML 로 내려오는 경우가 많다.
    const reason = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)?.[1]
      ?? text.match(/<errMsg>([^<]+)<\/errMsg>/)?.[1]
      ?? text.match(/<headerMsg>([^<]+)<\/headerMsg>/)?.[1];
    if (reason?.includes('SERVICE_KEY') || reason?.includes('SERVICE KEY')) {
      throw new ApiError('서비스 인증키가 올바르지 않거나 아직 승인되지 않았습니다.', 500);
    }
    throw new ApiError(`버스 정보 서버 응답을 해석하지 못했습니다${reason ? `: ${reason}` : ''}`);
  }
}

// ---------------------------------------------------------------------------
// 서울특별시 — ws.bus.go.kr 정류소정보조회 getStationByUid (arsId = 5자리 정류장 번호)
// ---------------------------------------------------------------------------
export function seoulProvider({ serviceKey, fetchImpl = fetch }) {
  return {
    id: 'seoul',
    name: '서울',
    async getArrivals(stopNumber) {
      const url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid'
        + `?serviceKey=${encodeServiceKey(serviceKey)}&arsId=${encodeURIComponent(stopNumber)}&resultType=json`;
      const data = await fetchJson(url, fetchImpl);
      const header = data?.msgHeader ?? {};
      const items = toList(data?.msgBody?.itemList);
      if (String(header.headerCd) !== '0' && items.length === 0) {
        if (['4', '8'].includes(String(header.headerCd))) {
          throw new ApiError(`서울 정류장 ${stopNumber} 을(를) 찾지 못했습니다.`, 404);
        }
        throw new ApiError(header.headerMsg || '서울 버스 API 오류');
      }
      if (items.length === 0) throw new ApiError(`서울 정류장 ${stopNumber} 을(를) 찾지 못했습니다.`, 404);

      const first = items[0];
      return {
        station: { id: first.stId ?? null, number: first.arsId ?? stopNumber, name: first.stNm ?? '' },
        arrivals: items.map((it) => ({
          route: it.rtNm,
          direction: it.adirection ? `${it.adirection} 방면` : (it.nxtStn ? `${it.nxtStn} 방향` : ''),
          buses: [1, 2]
            .map((n) => seoulBus(it, n))
            .filter(Boolean),
        })),
      };
    },
  };
}

function seoulBus(it, n) {
  const message = it[`arrmsg${n}`] ?? '';
  if (!message || message.includes('운행종료') || message.includes('출발대기')) {
    return message ? { etaSeconds: null, message, stopsAway: null, plate: null, seats: null } : null;
  }
  // arrmsg 예: "3분12초후[2번째 전]", "곧 도착"
  const stops = message.match(/\[(\d+)번째 전\]/)?.[1];
  return {
    etaSeconds: toInt(it[`traTime${n}`]),
    message,
    stopsAway: stops ? Number(stops) : null,
    plate: it[`plainNo${n}`] || null,
    seats: null,
  };
}

// ---------------------------------------------------------------------------
// 경기도 — apis.data.go.kr/6410000 (v2). 정류장 번호(mobileNo) → stationId → 도착정보
// ---------------------------------------------------------------------------
export function gyeonggiProvider({ serviceKey, fetchImpl = fetch }) {
  const key = encodeServiceKey(serviceKey);
  const stationCache = new Map();

  async function findStation(stopNumber) {
    if (stationCache.has(stopNumber)) return stationCache.get(stopNumber);
    const url = 'https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationListv2'
      + `?serviceKey=${key}&keyword=${encodeURIComponent(stopNumber)}&format=json`;
    const data = await fetchJson(url, fetchImpl);
    checkGyeonggiHeader(data);
    const list = toList(data?.response?.msgBody?.busStationList);
    const found = list.find((s) => String(s.mobileNo ?? '').trim() === stopNumber);
    if (!found) throw new ApiError(`경기 정류장 ${stopNumber} 을(를) 찾지 못했습니다.`, 404);
    const station = { id: String(found.stationId), number: stopNumber, name: found.stationName ?? '' };
    stationCache.set(stopNumber, station);
    return station;
  }

  return {
    id: 'gyeonggi',
    name: '경기',
    async getArrivals(stopNumber) {
      const station = await findStation(stopNumber);
      const url = 'https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2'
        + `?serviceKey=${key}&stationId=${encodeURIComponent(station.id)}&format=json`;
      const data = await fetchJson(url, fetchImpl);
      const code = checkGyeonggiHeader(data, { allowEmpty: true });
      const items = code === 4 ? [] : toList(data?.response?.msgBody?.busArrivalList);
      return {
        station,
        arrivals: items.map((it) => ({
          route: String(it.routeName ?? ''),
          direction: it.routeDestName ? `${it.routeDestName} 방면` : '',
          buses: [1, 2].map((n) => gyeonggiBus(it, n)).filter(Boolean),
        })),
      };
    },
  };
}

function checkGyeonggiHeader(data, { allowEmpty = false } = {}) {
  const header = data?.response?.msgHeader;
  if (!header) throw new ApiError('경기 버스 API 응답 형식이 올바르지 않습니다.');
  const code = Number(header.resultCode);
  if (code === 0) return code;
  if (code === 4) {
    if (allowEmpty) return code;
    throw new ApiError('경기 정류장을 찾지 못했습니다.', 404);
  }
  throw new ApiError(header.resultMessage || `경기 버스 API 오류 (코드 ${code})`);
}

function gyeonggiBus(it, n) {
  const minutes = toInt(it[`predictTime${n}`]);
  if (minutes == null) return null;
  const stops = toInt(it[`locationNo${n}`]);
  const seats = toInt(it[`remainSeatCnt${n}`]);
  return {
    etaSeconds: minutes * 60,
    message: minutes <= 1 ? '곧 도착' : `${minutes}분 후`,
    stopsAway: stops,
    plate: it[`plateNo${n}`] || null,
    // -1 은 좌석 정보 없음(입석 버스 등)
    seats: seats != null && seats >= 0 ? seats : null,
  };
}

// ---------------------------------------------------------------------------
// 키 없이 화면을 확인하기 위한 가짜 데이터
// ---------------------------------------------------------------------------
export function mockProvider(id, name) {
  const routes = [
    ['143', '정릉 방면'], ['401', '장지동 방면'], ['6411', '개포동 방면'],
    ['N13', '상계동 방면'], ['M5107', '서울역 방면'], ['9401', '분당 방면'],
  ];
  return {
    id,
    name: `${name} (MOCK)`,
    async getArrivals(stopNumber) {
      if (!/^\d{5}$/.test(stopNumber)) throw new ApiError(`정류장 ${stopNumber} 을(를) 찾지 못했습니다.`, 404);
      const seed = Number(stopNumber);
      const now = Math.floor(Date.now() / 1000);
      return {
        station: { id: `MOCK${stopNumber}`, number: stopNumber, name: '가상정류장' },
        arrivals: routes.map(([route, direction], i) => {
          // 시간이 흐르면 실제처럼 줄어들도록 현재 시각 기준으로 계산
          const period = 600 + ((seed + i * 137) % 900);
          const eta1 = period - ((now + i * 211) % period);
          return {
            route,
            direction,
            buses: [eta1, eta1 + period].map((eta) => ({
              etaSeconds: eta,
              message: eta < 60 ? '곧 도착' : `${Math.floor(eta / 60)}분${eta % 60}초후`,
              stopsAway: Math.max(1, Math.round(eta / 120)),
              plate: `서울70사${String(1000 + ((seed + eta) % 9000)).padStart(4, '0')}`,
              seats: i % 2 ? (seed + eta) % 40 : null,
            })),
          };
        }),
      };
    },
  };
}

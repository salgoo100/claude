import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  seoulProvider, gyeonggiProvider, encodeServiceKey, normalizeRoute,
} from '../lib/providers.js';
import { createHandler, buildProviders } from '../server.js';

const jsonFetch = (routes) => async (url) => {
  const hit = Object.entries(routes).find(([frag]) => url.includes(frag));
  if (!hit) throw new Error(`unexpected url ${url}`);
  const body = typeof hit[1] === 'string' ? hit[1] : JSON.stringify(hit[1]);
  return new Response(body, { status: 200 });
};

test('encodeServiceKey keeps encoded keys and encodes raw ones', () => {
  assert.equal(encodeServiceKey('ab%2Bcd%3D%3D'), 'ab%2Bcd%3D%3D');
  assert.equal(encodeServiceKey('ab+cd=='), 'ab%2Bcd%3D%3D');
});

test('normalizeRoute ignores spaces, dashes and case', () => {
  assert.equal(normalizeRoute(' n-13 '), 'N13');
});

test('seoul provider parses getStationByUid', async () => {
  const p = seoulProvider({
    serviceKey: 'k',
    fetchImpl: jsonFetch({
      getStationByUid: {
        msgHeader: { headerCd: '0', headerMsg: '정상' },
        msgBody: {
          itemList: [
            { stId: '1', arsId: '01234', stNm: '광화문', rtNm: '143', adirection: '정릉', arrmsg1: '3분12초후[2번째 전]', traTime1: '192', plainNo1: '서울74사1234', arrmsg2: '운행종료', traTime2: '0' },
          ],
        },
      },
    }),
  });
  const r = await p.getArrivals('01234');
  assert.equal(r.station.name, '광화문');
  assert.equal(r.arrivals[0].route, '143');
  assert.deepEqual(r.arrivals[0].buses[0], { etaSeconds: 192, message: '3분12초후[2번째 전]', stopsAway: 2, plate: '서울74사1234', seats: null });
  assert.equal(r.arrivals[0].buses[1].etaSeconds, null);
});

test('seoul provider reports invalid service key from XML response', async () => {
  const p = seoulProvider({
    serviceKey: 'bad',
    fetchImpl: jsonFetch({ getStationByUid: '<ServiceResult><msgHeader><headerCd>7</headerCd><headerMsg>SERVICE KEY IS NOT REGISTERED ERROR.</headerMsg></msgHeader></ServiceResult>' }),
  });
  await assert.rejects(p.getArrivals('01234'), /인증키/);
});

test('gyeonggi provider resolves mobileNo then parses arrivals (single object list)', async () => {
  const p = gyeonggiProvider({
    serviceKey: 'k',
    fetchImpl: jsonFetch({
      getBusStationListv2: {
        response: {
          msgHeader: { resultCode: 0 },
          msgBody: { busStationList: [{ stationId: 999, mobileNo: '12346', stationName: '다른곳' }, { stationId: 228000704, mobileNo: ' 12345', stationName: '수원역' }] },
        },
      },
      getBusArrivalListv2: {
        response: {
          msgHeader: { resultCode: 0 },
          msgBody: { busArrivalList: { routeName: 7770, routeDestName: '사당역', predictTime1: 5, locationNo1: 3, plateNo1: '경기70아1111', remainSeatCnt1: 12, predictTime2: '', remainSeatCnt2: -1 } },
        },
      },
    }),
  });
  const r = await p.getArrivals('12345');
  assert.equal(r.station.id, '228000704');
  assert.equal(r.arrivals.length, 1);
  assert.equal(r.arrivals[0].route, '7770');
  assert.deepEqual(r.arrivals[0].buses, [{ etaSeconds: 300, message: '5분 후', stopsAway: 3, plate: '경기70아1111', seats: 12 }]);
});

test('gyeonggi provider 404s when no station matches the number', async () => {
  const p = gyeonggiProvider({
    serviceKey: 'k',
    fetchImpl: jsonFetch({ getBusStationListv2: { response: { msgHeader: { resultCode: 4 }, msgBody: {} } } }),
  });
  await assert.rejects(p.getArrivals('11111'), (err) => err.status === 404);
});

test('HTTP API filters by bus number and suggests routes when missing', async () => {
  const server = http.createServer(createHandler(buildProviders({}, { mock: true })));
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const ok = await (await fetch(`${base}/api/arrivals?region=seoul&stop=01234&bus=m5107`)).json();
    assert.equal(ok.routeFound, true);
    assert.deepEqual(ok.arrivals.map((a) => a.route), ['M5107']);

    const miss = await (await fetch(`${base}/api/arrivals?region=seoul&stop=01234&bus=999`)).json();
    assert.equal(miss.routeFound, false);
    assert.ok(miss.availableRoutes.includes('143'));

    const bad = await fetch(`${base}/api/arrivals?region=seoul&stop=12`);
    assert.equal(bad.status, 400);

    const page = await fetch(`${base}/`);
    assert.match(await page.text(), /버스 도착 알리미/);
    assert.notEqual((await fetch(`${base}/..%2fserver.js`)).status, 200);
  } finally {
    server.close();
  }
});

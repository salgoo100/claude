# 🚌 버스 도착 알리미

정류장 번호(5자리)와 버스 번호를 넣으면 실시간 **도착 예정 시간**을 보여주는 웹앱입니다.

- 지역: **서울**(서울시 버스정보), **경기**(경기도 버스정보) 지원
- 버스 번호를 비우면 해당 정류장의 전체 노선 표시 / 없는 번호면 정류장에 서는 노선을 버튼으로 제안
- 30초마다 자동 갱신 + 1초 단위 카운트다운, 3분 이내 도착은 빨간색 강조
- 남은 정거장 수, 차량 번호, 빈자리(경기 좌석버스) 표시
- 즐겨찾기(브라우저 저장), 마지막 조회 기억, 링크로 바로 조회: `/?region=seoul&stop=01234&bus=143`
- 모바일 화면/다크 모드 대응, 홈 화면에 추가 가능(PWA manifest)

## 1. 인증키 발급 (무료)

[공공데이터포털](https://www.data.go.kr)에 로그인 후 아래 API를 **활용신청**합니다. 보통 즉시~1시간 내 자동 승인됩니다.

| 지역 | 활용신청할 API |
| --- | --- |
| 서울 | 서울특별시_정류소정보조회 서비스 |
| 경기 | 경기도_정류소 조회, 경기도_버스도착정보 조회 |

마이페이지에서 **일반 인증키**(Encoding/Decoding 아무거나)를 복사합니다.

## 2. 실행

Node.js 18 이상만 있으면 되고, 설치할 패키지는 없습니다.

```bash
cd apps/bus-arrival-2026-10
cp .env.example .env      # 발급받은 키를 SEOUL_SERVICE_KEY / GYEONGGI_SERVICE_KEY 에 입력
npm start                 # → http://localhost:3000
```

키 없이 화면만 먼저 보고 싶다면 가짜 데이터 모드:

```bash
npm run mock
```

휴대폰에서 쓰려면 같은 Wi‑Fi에서 `http://<PC의 IP>:3000` 으로 접속하거나, Render/Railway/Fly.io 같은 Node 호스팅에 올리고 환경변수에 키를 넣으면 됩니다.

## 구조

```
server.js          # 정적 파일 + /api 프록시 (인증키를 브라우저에 노출하지 않고 CORS 회피), 15초 캐시
lib/providers.js   # 서울/경기 API 호출 및 응답 정규화, MOCK 데이터
public/            # 화면 (HTML/CSS/JS, 빌드 불필요)
test/              # node:test 단위/통합 테스트 → npm test
```

### API

`GET /api/arrivals?region=seoul|gyeonggi&stop=<정류장번호>&bus=<버스번호(선택)>`

```json
{
  "station": { "id": "...", "number": "01234", "name": "광화문" },
  "arrivals": [
    { "route": "143", "direction": "정릉 방면",
      "buses": [{ "etaSeconds": 192, "message": "3분12초후[2번째 전]", "stopsAway": 2, "plate": "서울74사1234", "seats": null }] }
  ],
  "routeFound": true
}
```

## 참고

- 정류장 번호는 정류장 표지판이나 카카오맵/네이버지도 정류장 정보에 있는 5자리 번호입니다.
- 서울 API 는 `http://ws.bus.go.kr`, 경기 API 는 `https://apis.data.go.kr/6410000` (v2)를 사용합니다.
- 실제 API 응답은 개발 환경의 네트워크 제한으로 직접 호출해 보지 못했고, 공식 응답 형식 기준의 테스트로 검증했습니다.

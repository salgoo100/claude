// Vercel 서버리스 함수: 환경변수(인증키)로 provider 를 만들고 server.js 의 핸들러를 그대로 쓴다.
import { createHandler, buildProviders } from '../server.js';

export default createHandler(buildProviders(process.env));

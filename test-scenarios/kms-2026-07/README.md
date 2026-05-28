# KMS 2026-07 Test Scenarios

> Key Management Service — 2026년 7월 (BN_260000_v0.5, CX 진행중)

Figma 디자인을 기반으로 작성된 **기능 + UI/UX 테스트 시나리오**입니다.

## 📂 파일

| 파일 | 설명 |
| --- | --- |
| [`test-scenarios.md`](./test-scenarios.md) | Markdown 원본 — 각 TC가 Jira/Xray Test 이슈로 바로 등록 가능한 구조 (Summary / Priority / Components / Labels / Steps) |
| [`test-scenarios.html`](./test-scenarios.html) | 보기 좋게 스타일링된 HTML (라이트/다크 자동 전환, 사이드바 TOC) |
| [`xray-import.csv`](./xray-import.csv) | **Xray Cloud CSV 일괄 import** 용. 47개 TC, 186 step row. Jira 의 Xray import 메뉴에 업로드하면 Test 이슈가 일괄 생성됩니다. |

## 🧭 문서 구성

1. **공통 사항** — 사전 조건, 공통 UI/UX 검증, 용어 정의
2. **Service Home** — 진입·위젯·CTA·권한·Empty State·다크 테마 (6 TC)
3. **고객 관리형 키 (Customer Managed Key)** — 리스트/생성/상세/자동 회전/활성화/접근 제어(퍼블릭·프라이빗)/서비스 해지/삭제 (약 25 TC)
4. **플랫폼 관리형 키 (Platform Managed Key)** — 리스트/상세/권한/Empty/다국어 (약 8 TC)
5. **교차 시나리오** — 네비게이션, 활동 로그 일관성, 동시 편집, 세션 만료
6. **UI/UX 시각 검증 체크리스트** — 레이아웃·색상·상태·인터랙션·접근성
7. **회귀 테스트 우선순위 (Smoke Set)** — 빌드마다 돌리는 코어 9 케이스
8. **Open Questions** — 추가 확인 필요 사항

## 🔗 참고

- **Figma 파일**: `AcsgCKO9iBfl947ihQadxk`
- **버전**: BN_260000_v0.5
- **작성일**: 2026-05-28

## 🔄 HTML 재생성

`test-scenarios.md`를 수정한 뒤 HTML을 다시 만들고 싶다면, 저장소 루트의 [`scripts/md-to-html.py`](../../scripts/md-to-html.py) 를 실행하세요:

```bash
python3 scripts/md-to-html.py test-scenarios/kms-2026-07/test-scenarios.md
```

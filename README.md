# claude

Claude와 함께 만든 산출물 모음 — 테스트 시나리오, 디자인 분석, 자동화 스크립트 등.

## 📁 디렉토리 구조

```
.
├── README.md                       # 이 파일
├── test-scenarios/                 # 테스트 시나리오 모음
│   └── kms-2026-07/                # 2026년 7월 Key Management Service
│       ├── README.md
│       ├── test-scenarios.md       # Markdown 원본 (Xray Test 등록용 구조)
│       ├── test-scenarios.html     # 스타일링된 HTML 뷰
│       └── xray-import.csv         # Xray CSV 일괄 import 파일
└── scripts/                        # 변환·자동화 스크립트
    ├── md-to-html.py               # Markdown → HTML 변환기 (Python)
    └── md-to-html.mjs              # 동일 기능의 Node 대안
```

## 📦 콘텐츠

### Test Scenarios

| 폴더 | 내용 |
| --- | --- |
| [`test-scenarios/kms-2026-07`](./test-scenarios/kms-2026-07) | Key Management Service 2026년 7월 릴리즈 (Customer/Platform Managed Key, Service Home, 접근 제어, 서비스 해지) — 기능 + UI/UX 검증 |

## 🛠️ 스크립트

### Markdown → HTML 변환

Python 또는 Node 둘 중 편한 쪽으로:

```bash
# Python
pip install markdown
python3 scripts/md-to-html.py test-scenarios/kms-2026-07/test-scenarios.md

# 또는 Node (Python 없는 환경)
cd scripts && npm install marked --no-save
node scripts/md-to-html.mjs test-scenarios/kms-2026-07/test-scenarios.md
```

생성되는 HTML은 GitHub 스타일 + 라이트/다크 자동 전환 + 사이드바 TOC를 포함합니다.

## ✍️ 기여 방법

새로운 시나리오나 산출물은 카테고리 폴더(`test-scenarios/`, `analysis/`, `templates/` 등) 아래에 **`<주제>-<YYYY-MM>` 형식**의 서브폴더로 추가해 주세요.

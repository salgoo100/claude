# claude

Claude와 함께 만든 산출물 모음 — 테스트 시나리오, 디자인 분석, 자동화 스크립트 등.

## 📁 디렉토리 구조

```
.
├── README.md                       # 이 파일
├── test-scenarios/                 # 테스트 시나리오 모음
│   └── kms-2026-07/                # 2026년 7월 Key Management Service
│       ├── README.md
│       ├── test-scenarios.md       # Markdown 원본
│       └── test-scenarios.html     # 스타일링된 HTML 뷰
└── scripts/                        # 변환·자동화 스크립트
    └── md-to-html.py               # Markdown → 스타일링 HTML 변환기
```

## 📦 콘텐츠

### Test Scenarios

| 폴더 | 내용 |
| --- | --- |
| [`test-scenarios/kms-2026-07`](./test-scenarios/kms-2026-07) | Key Management Service 2026년 7월 릴리즈 (Customer/Platform Managed Key, Service Home, 접근 제어, 서비스 해지) — 기능 + UI/UX 검증 |

## 🛠️ 스크립트

### Markdown → HTML 변환

```bash
# 의존성 (한 번만)
pip install markdown

# 단일 파일 변환 (옆에 .html 파일 생성)
python3 scripts/md-to-html.py test-scenarios/kms-2026-07/test-scenarios.md
```

생성되는 HTML은 GitHub 스타일 + 라이트/다크 자동 전환 + 사이드바 TOC를 포함합니다.

## ✍️ 기여 방법

새로운 시나리오나 산출물은 카테고리 폴더(`test-scenarios/`, `analysis/`, `templates/` 등) 아래에 **`<주제>-<YYYY-MM>` 형식**의 서브폴더로 추가해 주세요.

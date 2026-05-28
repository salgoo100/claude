# GitHub 푸시 가이드

이 폴더(`claude-repo/`)의 내용을 https://github.com/salgoo100/claude.git 에 업로드하는 방법입니다.

> Claude의 샌드박스에서는 외부 github.com 접근이 차단되어 직접 push할 수 없어, 아래 명령을 사용자분 로컬 터미널에서 실행해 주세요.

---

## 시나리오 A — 처음 푸시하는 경우 (Repository가 비어 있을 때)

PowerShell / Terminal에서:

```bash
# 1) claude-repo 폴더로 이동
cd "C:\Users\salgo\Documents\Claude\Projects\Figma\claude-repo"

# 2) Git 초기화 및 원격 연결
git init
git branch -M main
git remote add origin https://github.com/salgoo100/claude.git

# 3) 커밋
git add .
git commit -m "Add KMS 2026-07 test scenarios (md + html)"

# 4) 푸시
git push -u origin main
```

> 만약 원격에 이미 다른 초기 커밋(예: 자동 생성된 README)이 있다면 push가 거부될 수 있어요.
> 그런 경우엔 **시나리오 B**를 따라가시거나, 강제 푸시를 원하시면 마지막 줄을 `git push -u origin main --force` 로 변경하세요. (force는 원격의 기존 내용을 덮어씁니다 — 확인 후 사용)

---

## 시나리오 B — 기존 Repository에 추가하는 경우

이미 https://github.com/salgoo100/claude.git 가 클론되어 있다면:

```bash
# 1) 기존 로컬 클론으로 이동
cd /path/to/your/existing/claude

# 2) 이 폴더의 파일들을 복사 (덮어쓰지 않게 주의)
#    Windows PowerShell:
xcopy "C:\Users\salgo\Documents\Claude\Projects\Figma\claude-repo\*" . /E /I /Y

#    macOS / Linux:
cp -R "/path/to/Figma/claude-repo/." .

# 3) 변경 사항 확인
git status

# 4) 커밋 & 푸시
git add .
git commit -m "Add KMS 2026-07 test scenarios (md + html)"
git push
```

---

## 시나리오 C — 깨끗하게 클론부터 새로 시작

```bash
# 어디에든 클론
git clone https://github.com/salgoo100/claude.git
cd claude

# 이 폴더의 모든 파일 복사
#    Windows PowerShell:
xcopy "C:\Users\salgo\Documents\Claude\Projects\Figma\claude-repo\*" . /E /I /Y
#    macOS / Linux:
cp -R "/path/to/Figma/claude-repo/." .

git add .
git commit -m "Add KMS 2026-07 test scenarios (md + html)"
git push
```

---

## 인증

처음 push할 때 GitHub 자격 증명을 묻습니다.

- **HTTPS + PAT (권장)**: GitHub → Settings → Developer settings → Personal access tokens 에서 token 발급 후 비밀번호 자리에 입력
- **SSH**: 원격 주소를 `git@github.com:salgoo100/claude.git` 로 변경하고 SSH 키 등록
- **GitHub CLI**: `gh auth login` 으로 한 번에 인증

---

## 푸시 후 확인

성공하면 https://github.com/salgoo100/claude 에 아래 구조가 보입니다:

```
claude/
├── README.md
├── PUSH_GUIDE.md
├── .gitignore
├── scripts/
│   └── md-to-html.py
└── test-scenarios/
    └── kms-2026-07/
        ├── README.md
        ├── test-scenarios.md
        └── test-scenarios.html
```

HTML 파일은 GitHub에서는 raw로만 렌더링되지만, **GitHub Pages**를 활성화하면 (`Settings → Pages → Branch: main`) 브라우저에서 바로 볼 수 있게 됩니다:

```
https://salgoo100.github.io/claude/test-scenarios/kms-2026-07/test-scenarios.html
```

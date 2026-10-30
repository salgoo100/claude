---
name: work-log
description: 업무 일지를 기록·조회하고 HTML 리포트나 캘린더(.ics: Google/Outlook/Apple Calendar)로 내보낸다. 사용자가 "업무 일지", "오늘 한 일 기록", "work log", "이번 주 업무 정리", "캘린더로 내보내" 등을 말하면 사용한다.
---

# Work Log

업무 기록은 저장소 루트의 `worklog/YYYY-MM.jsonl` 에 한 줄당 한 항목(JSON)으로 저장한다.
모든 작업은 `scripts/worklog.py` (Python 3 표준 라이브러리만 사용)로 한다.

## 항목 형식

| 필드 | 필수 | 예 |
| --- | --- | --- |
| `date` | ✔ | `2026-10-30` |
| `title` | ✔ | `KMS 테스트 시나리오 리뷰` |
| `start` / `end` | | `09:30` / `11:00` (없으면 종일 항목) |
| `category` | | `회의`, `개발`, `리뷰`, `문서` … |
| `tags` | | `["kms","qa"]` |
| `notes` | | 자유 메모 |
| `id` | 자동 | 스크립트가 생성 |

## 명령

```bash
S=.claude/skills/work-log/scripts/worklog.py
python3 $S add --title "스프린트 회의" --date 2026-10-30 --start 10:00 --end 11:00 --category 회의 --tags sprint,team --notes "다음 주 배포 일정 확정"
python3 $S list --from 2026-10-27 --to 2026-10-31          # 기간 조회 (텍스트)
python3 $S delete --id <id>                                 # 항목 삭제
python3 $S html --from 2026-10-01 --to 2026-10-31 -o worklog/report-2026-10.html
python3 $S ics  --from 2026-10-01 --to 2026-10-31 -o worklog/worklog-2026-10.ics
```

`--date` 생략 시 오늘, `--from/--to` 생략 시 전체 기간.

## 작업 방식

1. **기록**: 사용자가 자연어로 한 일을 말하면 날짜·시간·제목·카테고리·태그·메모로 나눠 `add` 를 항목마다 호출한다. 시간이 모호하면 종일 항목으로 두고, 제목은 짧게, 세부 내용은 `notes` 에 넣는다.
2. **조회/요약**: `list` 결과를 읽고 날짜별·카테고리별로 요약해 답한다 (주간 보고 등).
3. **HTML**: `html` 로 리포트를 만든 뒤 사용자에게 파일을 전달한다 (Artifact 로 게시해도 된다).
4. **캘린더 연동**: `ics` 로 만든 파일을 가져오기 한다.
   - Google Calendar: 설정 → 가져오기/내보내기 → 가져오기
   - Outlook: 캘린더 추가 → 파일에서 업로드
   - Apple Calendar: 파일 → 가져오기
   - 각 항목의 UID 가 고정이라 다시 가져와도 같은 일정이 갱신된다.
   - 캘린더 커넥터(MCP)가 연결돼 있으면 `list --json` 결과로 일정을 직접 만들어도 된다.
5. 기록을 바꾼 뒤에는 `worklog/` 변경을 커밋한다.

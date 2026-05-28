# Key Management Service (KMS) — 2026년 7월 테스트 시나리오

> **대상 문서**: g3 2026 7월 — Key Management Service_BN_260000_v0.5 (CX 진행중)
> **Figma 파일 키**: `AcsgCKO9iBfl947ihQadxk`
> **작성일**: 2026-05-28
> **테스트 유형**: 기능 테스트 (Functional) + UI/UX 검증
> **테스트 환경 가정**: 웹 브라우저 (Chrome 최신 안정 버전), 데스크탑 1920×1080, 라이트/다크 테마 모두

---

## 0. 사용 가이드 — Jira / Xray 등록

본 문서는 각 TC를 **Xray Test 이슈**로 등록할 수 있도록 표준화된 헤더 + Step 표 구조로 작성되어 있습니다.

### 등록 방법 A — 일괄 import (권장)

같은 폴더의 [`xray-import.csv`](./xray-import.csv) 를 Xray 의 **Import Execution Results / Test Cases** 화면에서 업로드하면 47개 TC가 한 번에 생성됩니다.

### 등록 방법 B — 수동 입력 (개별 복사)

각 TC 블록의 필드를 그대로 Jira/Xray 입력 폼에 복사하면 됩니다.

| 마크다운 항목 | Jira/Xray 입력 위치 |
| --- | --- |
| **Summary** | Jira Summary |
| **Issue Type** / **Test Type** / **Priority** | 동일 필드 |
| **Components** | Components 필드 (없으면 신규 생성) |
| **Labels** | Labels 필드 (공백 없이, 토큰별로 분리) |
| **Pre-condition** | Xray Test Detail → Preconditions |
| **Description** | Jira Description (위키 마크업) |
| **Steps** 표 | Xray Test Detail → Steps (Action / Data / Expected Result) |

### 공통 사전 조건 (모든 TC 공통)

> 아래 4개는 모든 TC가 공유합니다. Pre-condition 칸에 별도로 적지 않고 본 절을 참조합니다.

- 테스트 계정이 KMS 서비스에 정상적으로 등록되어 있음
- 테스트용 프로젝트/리전이 사전 세팅되어 있음
- 권한 검증용 계정 3종 준비: **KMS Admin / KMS User / Viewer**
- 네트워크 / 세션 상태 정상

### 공통 UI/UX 검증 포인트

> 본 문서의 모든 화면 단위 TC가 공통적으로 만족해야 합니다.

- 페이지 로드 시 1차 콘텐츠가 2초 이내 표시
- 라이트 / 다크 테마 토글 시 모든 요소가 누락 없이 전환
- 한국어 UI에 잘림(truncation) 또는 줄바꿈 깨짐 없음
- 키보드 포커스 이동(Tab) 시 시각적 포커스 링이 명확히 보임
- 모든 버튼/링크에 hover, active, disabled 상태 정의
- 오류·성공 토스트가 일관된 위치(우상단 또는 상단)에 노출

### 용어

| 용어 | 정의 |
| --- | --- |
| 고객 관리형 키 (CMK) | 고객이 직접 생성·관리하는 암호화 키 |
| 플랫폼 관리형 키 (PMK) | 플랫폼이 자동으로 발급·운용하는 키 |
| 키 회전 (Rotation) | 키의 암호 자료를 새로운 버전으로 갱신하는 작업 |
| 활성화 / 비활성화 | 키 사용 가능 여부 토글 |
| 서비스 해지 | 키와 연결된 KMS 서비스 자체 종료 (즉시 / 예약 / 취소) |

---

## 1. Service Home

### TC-SH-001 — 서비스 홈 정상 진입

**Summary**: `[KMS] Service Home · 정상 진입`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / Service Home
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: KMS 사용 권한 보유 계정으로 로그인 완료

**Description**: KMS Service Home 진입 시 헤더·GNB·메인 영역이 정상적으로 표시되는지 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 콘솔 좌측 네비게이션에서 **Key Management Service** 클릭 | — | KMS Service Home 화면으로 이동 |
| 2 | 페이지 헤더 · 좌측 GNB · 메인 영역을 확인 | — | • 헤더에 "Key Management Service" 타이틀 표시<br>• 좌측 GNB가 강조(active) 상태<br>• 메인 영역에 서비스 개요 카드/대시보드 정상 노출 |
| 3 | 라이트/다크 테마 각각에서 색상 대비를 확인 | WCAG AA (4.5:1) | 두 테마 모두 텍스트 가독성 4.5:1 이상 |

---

### TC-SH-002 — 서비스 홈 주요 위젯 표시

**Summary**: `[KMS] Service Home · 주요 위젯 표시 확인`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Service Home
**Labels**: `kms` `kms-2026-07` `functional` `ui-ux`

**Pre-condition**: TC-SH-001 완료 (서비스 홈 진입 가능 상태)

**Description**: 홈 화면 위젯이 일관된 카드 레이아웃과 디자인 토큰을 따르며, 더보기 라우팅이 정상 동작하는지 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 홈 화면의 위젯 영역을 확인 | — | "최근 키", "이번 달 키 사용량", "공지/업데이트" 등 위젯이 카드 레이아웃으로 나열됨 |
| 2 | 카드 간 여백 / 그림자 / 테두리를 디자인 토큰과 비교 | spacing: 24px | 카드 간 여백 24px, 그림자·테두리가 디자인 토큰과 일치 |
| 3 | 각 카드의 **더 보기** CTA를 클릭 | — | 해당 상세 페이지로 이동 (동일 탭) |

---

### TC-SH-003 — 서비스 홈 "키 생성" CTA

**Summary**: `[KMS] Service Home · 키 생성 CTA 진입`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Service Home
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한 보유

**Description**: 서비스 홈 우측 상단의 *키 생성* CTA가 올바른 페이지로 라우팅되는지 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 홈 화면 우측 상단의 **키 생성** CTA 색상·아이콘 정렬 확인 | — | primary 색상, 아이콘 + 텍스트가 정확히 정렬 |
| 2 | **키 생성** CTA 클릭 | — | "고객 관리형 키" 생성 페이지 또는 키 종류 선택 모달로 이동 |
| 3 | 새 탭 / 동일 탭 동작 확인 | — | 새 탭이 아닌 동일 탭에서 라우팅 |

---

### TC-SH-004 — 서비스 홈 권한별 노출 차이 (Viewer)

**Summary**: `[KMS] Service Home · Viewer 권한 노출 차이`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Service Home
**Labels**: `kms` `kms-2026-07` `permission`

**Pre-condition**: Viewer 권한 계정 준비

**Description**: Viewer 계정에서 Admin 전용 액션이 적절히 숨겨지거나 비활성화되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | Viewer 계정으로 콘솔 로그인 | viewer.account | 정상 로그인 |
| 2 | KMS Service Home 진입 | — | 홈 화면 진입 가능 |
| 3 | "키 생성" CTA 및 Admin 전용 위젯 노출 상태 확인 | — | • **키 생성** CTA 비활성화 또는 비노출<br>• Admin 전용 위젯이 가려지거나 안내 메시지로 대체 |
| 4 | 비활성화된 버튼에 hover | — | tooltip 으로 사유 안내 (예: "권한이 없습니다") |

---

### TC-SH-005 — 서비스 홈 Empty State

**Summary**: `[KMS] Service Home · 키 0건 Empty State`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Low
**Components**: KMS / Service Home
**Labels**: `kms` `kms-2026-07` `empty-state`

**Pre-condition**: 키가 한 건도 등록되지 않은 신규 프로젝트

**Description**: 키 0건 상태에서 안내 일러스트 + CTA 가 적절히 노출되는지 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | KMS Service Home 진입 | — | 홈 화면 로드 |
| 2 | Empty State 영역 확인 | — | "아직 생성된 키가 없습니다" 일러스트 + 안내 문구 표시 |
| 3 | "키 생성" CTA 확인 | — | CTA 가 시각적으로 강조 표시되어 1차 행동 유도 |

---

### TC-SH-006 — 다크 테마 전환

**Summary**: `[KMS] Service Home · 다크 테마 전환`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Low
**Components**: KMS / Service Home
**Labels**: `kms` `kms-2026-07` `dark-theme` `ui-ux`

**Pre-condition**: TC-SH-001 완료

**Description**: 다크 모드 전환 시 모든 요소가 누락 없이 다크 토큰으로 전환되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 헤더의 테마 토글 클릭 | dark | 다크 모드로 전환 |
| 2 | 배경 · 카드 · 텍스트 · 차트 색상 점검 | — | 모든 요소가 다크 토큰으로 전환 (라이트 잔존 색상 없음) |
| 3 | 아이콘 / 이미지의 다크 환경 가독성 확인 | — | SVG 아이콘 · 일러스트가 다크 배경에서도 명확히 보임 |
| 4 | 토글로 다시 라이트로 복귀 | light | 원래 색상으로 정상 복귀 |

---

## 2. 고객 관리형 키 (Customer Managed Key, CMK)

### 2.1 키 리스트 조회

#### TC-CMK-LIST-001 — 키 리스트 정상 조회

**Summary**: `[KMS] CMK · 리스트 정상 조회`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / CMK / List
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: 1건 이상의 고객 관리형 키가 등록되어 있음

**Description**: 리스트의 컬럼 구성·정렬 기본값·페이지네이션·헤더 sticky 동작 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | GNB → **고객 관리형 키** 클릭 | — | CMK 리스트 화면 진입 |
| 2 | 테이블 컬럼 구성 확인 | — | 키 이름 / 상태 / 키 ID / 생성일 / 자동 회전 / 액션 컬럼이 순서대로 표시 |
| 3 | 기본 정렬 확인 | — | 생성일 내림차순 정렬 |
| 4 | 페이지네이션 또는 무한 스크롤 동작 확인 | — | 페이지 이동 또는 추가 로드 정상 동작 |
| 5 | 헤더 sticky · 행 hover 강조 확인 | — | 스크롤 시 헤더 고정, 마우스 hover 시 행 배경 강조 |

---

#### TC-CMK-LIST-002 — 검색 및 필터

**Summary**: `[KMS] CMK · 리스트 검색 / 필터 동작`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / List
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 10건 이상의 CMK 키 존재

**Description**: 키 이름 검색 · 상태 필터 · 자동 회전 필터의 즉시 반영과 필터 칩 제어 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상단 검색창에 키 이름 일부 입력 | `test` | 입력 즉시 또는 Enter 시 결과 필터링 |
| 2 | 상태 필터에서 "활성" 선택 | 활성 | 활성 상태 키만 표시 |
| 3 | 자동 회전 필터에서 "ON" 선택 | rotation:on | 두 조건 모두 만족하는 키만 표시 |
| 4 | 검색바 하단에 표시된 필터 칩의 X 클릭 | — | 해당 필터만 해제되고 나머지는 유지 |
| 5 | 결과 0건이 되는 조건 입력 | `존재하지않는이름` | "검색 결과가 없습니다" 빈 상태 표시 |

---

#### TC-CMK-LIST-003 — 정렬

**Summary**: `[KMS] CMK · 리스트 컬럼 정렬`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / List
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 다건의 CMK 키 존재

**Description**: 정렬 가능한 컬럼의 오름/내림차순 토글 및 시각적 표시 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | "키 이름" 컬럼 헤더 클릭 | — | 오름차순 정렬 + ▲ 아이콘 노출 |
| 2 | 동일 헤더 재클릭 | — | 내림차순 정렬 + ▼ 아이콘 노출 |
| 3 | "생성일" 컬럼 헤더 클릭 | — | 생성일 기준으로 정렬 전환, "키 이름" 정렬 표시는 해제 |

---

#### TC-CMK-LIST-004 — 페이지네이션

**Summary**: `[KMS] CMK · 리스트 페이지네이션`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / List
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 페이지당 표시 건수보다 많은 키 존재

**Description**: 페이지 이동·페이지 크기 변경 시 상태 유지 및 갱신 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 페이지 번호 / **Next** 버튼 클릭 | — | 다음 페이지로 갱신, 활성 페이지 번호 강조 |
| 2 | 페이지 크기를 변경 | 10 / 20 / 50 | 선택한 크기로 결과 재구성 |
| 3 | URL 파라미터 또는 내부 상태 확인 | — | 페이지/크기 정보가 URL 파라미터 또는 세션 상태로 유지됨 |

---

#### TC-CMK-LIST-005 — 리스트 Empty State

**Summary**: `[KMS] CMK · 리스트 Empty State`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Low
**Components**: KMS / CMK / List
**Labels**: `kms` `kms-2026-07` `empty-state`

**Pre-condition**: CMK 키 0건

**Description**: 키 0건 상태에서 안내·CTA 노출 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | CMK 리스트 진입 | — | 빈 상태 화면 표시 |
| 2 | 일러스트 · 안내 문구 · CTA 노출 확인 | — | • 일러스트 표시<br>• "고객 관리형 키를 생성해 보세요" 문구<br>• "키 생성" CTA 표시 |

---

### 2.2 키 생성 (등록)

#### TC-CMK-CREATE-001 — 키 생성 (필수 필드만)

**Summary**: `[KMS] CMK · 키 생성 (필수 필드만)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / CMK / Create
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: KMS Admin 권한

**Description**: 필수 필드만 입력한 경우의 키 생성 정상 흐름.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 리스트 화면에서 **키 생성** 클릭 | — | 키 생성 페이지로 이동 |
| 2 | 키 이름 입력 | `test-key-001` | 입력값 정상 반영, 인라인 검증 통과 |
| 3 | 키 종류·알고리즘 선택 | `AES-256` | 옵션 선택 가능 |
| 4 | **생성** 클릭 | — | • 생성 성공 토스트 노출<br>• 리스트 최상단에 신규 키가 "활성" 상태로 추가<br>• (옵션) 상세 페이지로 자동 이동 |

---

#### TC-CMK-CREATE-002 — 키 생성 (전체 필드)

**Summary**: `[KMS] CMK · 키 생성 (전체 필드)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Create
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한

**Description**: 설명·태그·자동 회전·접근 정책까지 전체 옵션 입력 시 상세 페이지 반영 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 키 이름 입력 | `prod-key-full` | 정상 반영 |
| 2 | 설명 입력 | `Production master key` | 정상 반영 |
| 3 | 태그 입력 | `env=prod`, `owner=sec-team` | 칩으로 표시 |
| 4 | 자동 회전 주기 선택 | 90일 | 다음 회전 예정일 자동 계산 |
| 5 | 퍼블릭/프라이빗 접근 정책 입력 | 프라이빗 (특정 리소스) | 입력값 반영 |
| 6 | **생성** 클릭 | — | 생성 완료 후 상세 페이지에서 모든 옵션이 정확히 반영되어 표시 |

---

#### TC-CMK-CREATE-003 — 키 생성 유효성 검사 (Negative)

**Summary**: `[KMS] CMK · 키 생성 유효성 (Negative)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Create
**Labels**: `kms` `kms-2026-07` `negative`

**Pre-condition**: KMS Admin 권한 / 이미 사용 중인 이름 1건 이상 존재

**Description**: 잘못된 입력값에 대해 인라인 에러와 버튼 disabled 가 정확히 동작하는지 확인.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 키 이름을 비운 상태로 시도 | (빈 값) | "이름은 필수 항목입니다" 인라인 에러, **생성** disabled |
| 2 | 특수문자만 입력 | `!@#$%^` | 명명 규칙 인라인 에러, **생성** disabled |
| 3 | 최대 길이 초과 입력 | 64자 초과 임의 문자열 | 길이 제한 인라인 에러, **생성** disabled |
| 4 | 이미 존재하는 키 이름 입력 | `existing-key` | "이미 사용 중인 이름입니다" 안내, **생성** disabled |

---

#### TC-CMK-CREATE-004 — 키 생성 취소

**Summary**: `[KMS] CMK · 키 생성 취소 (변경 폐기 확인)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Create
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한

**Description**: 입력 중 취소 시 데이터 손실 방지를 위한 확인 모달이 노출되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 키 이름 일부 입력 | `partial-input` | 정상 반영 |
| 2 | **취소** 클릭 | — | "변경 사항을 저장하지 않고 나갈까요?" 확인 모달 노출 |
| 3 | 모달의 **확인** 클릭 | — | 리스트로 복귀, 입력값 폐기 |
| 4 | 다시 키 생성 진입 → **취소** → 모달에서 **계속 작성** | — | 모달이 닫히고 입력값 유지 |

---

### 2.3 키 상세 조회

#### TC-CMK-DETAIL-001 — 상세 페이지 정보 표시

**Summary**: `[KMS] CMK · 상세 페이지 정보 표시`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / CMK / Detail
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: 1건 이상의 CMK 키 존재

**Description**: 상세 페이지 헤더·탭·우측 액션 구성 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 리스트에서 임의 키 클릭 | — | 키 상세 페이지 진입 |
| 2 | 헤더 구성 확인 | — | • 키 이름<br>• 상태 뱃지(활성/비활성/해지)<br>• 키 ID 복사 버튼 |
| 3 | 탭/섹션 구성 확인 | — | **개요 / 버전 / 접근 제어 / 활동 로그** 탭 존재 |
| 4 | 우측 액션 영역 확인 | — | 키 비활성화 / 자동 회전 설정 / 삭제 액션 노출 (권한 기반) |

---

#### TC-CMK-DETAIL-002 — 키 ID 복사

**Summary**: `[KMS] CMK · 키 ID 클립보드 복사`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Detail
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: CMK 상세 페이지 진입 상태

**Description**: 키 ID 옆 복사 아이콘 클릭 시 클립보드 복사·토스트 노출 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 키 ID 옆 복사 아이콘 클릭 | — | 클립보드에 키 ID 저장 |
| 2 | 토스트 노출 확인 | — | "복사되었습니다" 토스트 표시 |
| 3 | 다른 입력 필드에 붙여넣기 | Ctrl+V | 키 ID 가 정확히 붙여넣어짐 |

---

#### TC-CMK-DETAIL-003 — 설명 인라인 수정

**Summary**: `[KMS] CMK · 설명 인라인 수정`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Detail
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 상태 CMK 키 1건

**Description**: 대응 디자인 `설명 수정` (Local component) 의 인라인 편집 동작 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 설명 옆 연필 아이콘 클릭 | — | 인라인 입력 필드 활성화 |
| 2 | 텍스트 수정 후 **저장** 클릭 | `updated description` | • 토스트 노출<br>• 화면에 즉시 반영 |
| 3 | 빈 값으로 저장 시도 | (빈 값) | 저장 불가 (인라인 에러 또는 버튼 disabled) |

---

### 2.4 자동 회전 (Rotation)

#### TC-CMK-ROTATE-001 — 자동 회전 활성화

**Summary**: `[KMS] CMK · 자동 회전 활성화`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / CMK / Rotation
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 상태 CMK 키 1건

**Description**: 대응 디자인 `자동 회전 수정`. 활성화 후 다음 회전 예정일 자동 계산 및 활동 로그 기록 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상세 → 자동 회전 영역에서 **수정** 클릭 | — | 자동 회전 수정 패널 열림 |
| 2 | 활성 토글 ON | toggle:on | 주기 입력 필드 활성화 |
| 3 | 주기 입력 | 90 | 다음 회전 예정일 = 오늘 + 90일 미리보기 표시 |
| 4 | **저장** 클릭 | — | • 토스트 노출<br>• 다음 회전 예정일이 상세에 반영<br>• 활동 로그에 "자동 회전 설정" 이벤트 기록 |

---

#### TC-CMK-ROTATE-002 — 자동 회전 비활성화

**Summary**: `[KMS] CMK · 자동 회전 비활성화 (확인 모달)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Rotation
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 자동 회전이 활성화된 CMK 키 1건

**Description**: 비활성화 시 확인 모달이 노출되고, 회전 예정일이 "비활성" 표시되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 자동 회전 영역 → **수정** | — | 패널 열림 |
| 2 | 활성 토글 OFF → **저장** | toggle:off | "자동 회전 비활성화" 확인 모달 노출 |
| 3 | 모달의 **확인** 클릭 | — | • 토스트 노출<br>• 다음 회전 예정일 영역이 "비활성"으로 표시 |

---

#### TC-CMK-ROTATE-003 — 회전 주기 유효성 (Negative)

**Summary**: `[KMS] CMK · 회전 주기 유효성 (Negative)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Rotation
**Labels**: `kms` `kms-2026-07` `negative`

**Pre-condition**: KMS Admin 권한 / 활성 CMK 키 1건

**Description**: 비정상 회전 주기 입력 시 인라인 에러 및 저장 차단 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 주기에 0 입력 | 0 | 인라인 에러, **저장** disabled |
| 2 | 주기에 음수 입력 | -5 | 인라인 에러, **저장** disabled |
| 3 | 주기에 비숫자 입력 | `abc` | 인라인 에러, **저장** disabled |

---

### 2.5 활성화 / 비활성화

#### TC-CMK-STATE-001 — 키 비활성화 (재확인)

**Summary**: `[KMS] CMK · 키 비활성화 (이름 재확인)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / CMK / State
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 CMK 키 1건 (이름: `target-key`)

**Description**: 대응 디자인 `키 비활성화 재확인`. 이름 일치 시에만 비활성화 진행 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상세 → **키 비활성화** 클릭 | — | 재확인 모달 노출 |
| 2 | 재확인 모달에서 키 이름과 다른 값을 입력 | `wrong-name` | **비활성화** 버튼 disabled 유지 |
| 3 | 키 이름을 정확히 입력 | `target-key` | **비활성화** 버튼 활성화 |
| 4 | **비활성화** 클릭 | — | • 상태가 "비활성"으로 변경<br>• 뱃지 색상이 회색 계열로 변경<br>• 활동 로그 기록 |

---

#### TC-CMK-STATE-002 — 키 활성화

**Summary**: `[KMS] CMK · 비활성 키 활성화`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / State
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 비활성 상태 CMK 키 1건

**Description**: 활성화는 재확인 모달 없이 1-step 으로 동작하는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 비활성 상태 키의 상세 진입 | — | 상세 페이지 로드 |
| 2 | **활성화** 버튼 클릭 | — | • 별도 재확인 모달 없이 즉시 활성 상태로 전환<br>• 토스트 노출 |

---

#### TC-CMK-STATE-003 — 비활성 상태 기능 제한

**Summary**: `[KMS] CMK · 비활성 상태에서의 기능 제한`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / State
**Labels**: `kms` `kms-2026-07` `permission`

**Pre-condition**: 비활성 상태 CMK 키 1건

**Description**: 비활성 키에서 자동 회전·접근 제어 수정이 차단되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 비활성 키의 상세 진입 | — | 상세 페이지 로드 |
| 2 | 자동 회전 영역의 **수정** 시도 | — | "비활성 상태에서는 수정할 수 없습니다" 안내 또는 액션 disabled |
| 3 | 접근 제어 영역의 **수정** 시도 | — | 동일하게 차단 |

---

### 2.6 접근 제어 — 퍼블릭

#### TC-CMK-PUB-001 — 퍼블릭 접근 제어 수정

**Summary**: `[KMS] CMK · 퍼블릭 접근 제어 수정`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Public Access
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 CMK 키 1건

**Description**: 대응 디자인 `퍼블릭 접근 제어 수정`. 정책 변경 요약 모달 후 즉시 반영 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상세 → **접근 제어 / 퍼블릭** 탭 → **수정** | — | 정책 편집 화면 노출 |
| 2 | 정책 선택 | 허용 / 차단 / IAM 기반 중 택일 | 선택값 반영 |
| 3 | **저장** 클릭 | — | 변경 사항 요약 모달 노출 |
| 4 | 모달의 **확인** 클릭 | — | • 정책 뱃지 즉시 갱신<br>• 활동 로그 기록 |

---

#### TC-CMK-PUB-002 — 퍼블릭 정책 변경 취소

**Summary**: `[KMS] CMK · 퍼블릭 정책 변경 취소`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Public Access
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: TC-CMK-PUB-001 와 동일

**Description**: 정책 변경 후 취소 시 기존 정책이 유지되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 퍼블릭 정책 수정 화면에서 정책 변경 | 차단 → 허용 | 변경값 반영 |
| 2 | **취소** 클릭 | — | "변경 사항을 폐기할까요?" 확인 모달 노출 |
| 3 | 모달의 **확인** 클릭 | — | 기존 정책 유지, 변경값 폐기 |

---

### 2.7 접근 제어 — 프라이빗

#### TC-CMK-PRI-001 — 프라이빗 접근 허용 리소스 추가

**Summary**: `[KMS] CMK · 프라이빗 접근 허용 리소스 추가`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Private Access
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 CMK 키 1건

**Description**: 대응 디자인 `프라이빗 접근 허용 리소스 추가`. 리소스 종류 선택 → 검색·체크 → 추가 흐름 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상세 → 프라이빗 탭 → **리소스 추가** 클릭 | — | 리소스 추가 패널 노출 |
| 2 | 리소스 종류 선택 | VM / Container / Storage 등 | 종류에 맞는 검색 영역 노출 |
| 3 | 리소스 검색 후 체크박스 선택 | `vm-prod-01` | 선택된 리소스 카운트 표시 |
| 4 | 아무것도 선택하지 않은 상태에서 **추가** 버튼 상태 확인 | (0건 선택) | **추가** 버튼 disabled |
| 5 | 리소스 선택 후 **추가** 클릭 | — | 목록에 즉시 노출, 토스트 표시 |
| 6 | 이미 추가된 리소스 재추가 시도 | `vm-prod-01` | "이미 추가된 리소스입니다" 안내 |

---

#### TC-CMK-PRI-002 — 프라이빗 접근 제어 수정

**Summary**: `[KMS] CMK · 프라이빗 접근 제어 수정`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Private Access
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 프라이빗 허용 리소스 1건 이상 등록된 CMK 키

**Description**: 대응 디자인 `프라이빗 접근 제어 수정`. 권한 범위 변경 및 활동 로그 기록 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 기존 허용 리소스 행의 **수정** 클릭 | — | 수정 패널 노출 |
| 2 | 권한 범위 변경 | read-only → read-write | 변경값 반영 |
| 3 | **저장** 클릭 | — | • 변경 사항 저장<br>• 활동 로그에 기록 |

---

#### TC-CMK-PRI-003 — 프라이빗 리소스 제거 (단건/일괄)

**Summary**: `[KMS] CMK · 프라이빗 리소스 제거 (단건/일괄)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Private Access
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 프라이빗 허용 리소스 2건 이상 등록

**Description**: 단건/일괄 제거 동작 및 확인 모달 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 리소스 행의 휴지통 아이콘 클릭 | — | 단건 제거 확인 모달 |
| 2 | 모달의 **제거** 클릭 | — | 목록에서 사라짐, 토스트 표시 |
| 3 | 다중 체크박스로 2건 이상 선택 후 **일괄 제거** 클릭 | 2건 선택 | 일괄 제거 확인 모달 |
| 4 | 모달의 **제거** 클릭 | — | 선택된 모든 리소스 제거 |

---

### 2.8 서비스 해지

#### TC-CMK-TERM-001 — 즉시 해지

**Summary**: `[KMS] CMK · 서비스 즉시 해지`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / CMK / Termination
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 CMK 키 1건 (이름: `term-target`)

**Description**: 대응 디자인 `서비스 해지/즉시 해지`. 사전 안내 체크 → 이름 재확인 → 해지 흐름.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상세 → 우측 액션 **서비스 해지** 클릭 | — | 해지 모달 노출 |
| 2 | "즉시 해지" 옵션 선택 | immediate | 즉시 해지 흐름으로 전환 |
| 3 | 사전 안내 체크박스 모두 체크 | all-checked | **해지** 버튼 활성화 |
| 4 | 키 이름 재입력 | `term-target` | 이름 일치 시 진행 가능 |
| 5 | **해지** 클릭 | — | • 키 상태가 "해지됨"으로 변경<br>• 모든 액션 비활성화<br>• 활동 로그 기록 |

---

#### TC-CMK-TERM-002 — 예약 해지

**Summary**: `[KMS] CMK · 서비스 예약 해지`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Termination
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: KMS Admin 권한 / 활성 CMK 키 1건

**Description**: 대응 디자인 `서비스 해지/예약 해지`. 예약일 캘린더 동작·과거 일자 차단·예약 배너 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | **서비스 해지** → "예약 해지" 선택 | scheduled | 캘린더 영역 노출 |
| 2 | 과거 날짜 선택 시도 | 어제 날짜 | 선택 불가 (캘린더에서 비활성 표시) |
| 3 | 7일 뒤 날짜 선택 | today+7 | 선택값 반영 |
| 4 | **예약** 클릭 | — | • 상세 상단에 "YYYY-MM-DD 해지 예약됨" 배너 노출<br>• 키 상태는 활성 유지<br>• 활동 로그 기록 |

---

#### TC-CMK-TERM-003 — 예약 해지 취소

**Summary**: `[KMS] CMK · 예약 해지 취소`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Termination
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 예약 해지 상태인 CMK 키 1건

**Description**: 대응 디자인 `서비스 해지/해지 취소`. 배너의 해지 취소 클릭 → 모달 확인 → 정상 복귀.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 예약 배너의 **해지 취소** 클릭 | — | 해지 취소 확인 모달 노출 |
| 2 | 모달의 **확인** 클릭 | — | • 배너 사라짐<br>• 정상 상태 복귀<br>• 토스트 표시<br>• 활동 로그 기록 |

---

#### TC-CMK-TERM-004 — 해지 권한 검증

**Summary**: `[KMS] CMK · 해지 액션 권한 검증`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Termination
**Labels**: `kms` `kms-2026-07` `permission`

**Pre-condition**: KMS User · Viewer 권한 계정 각각

**Description**: Admin 외 권한에서 해지 액션 차단 여부 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | Viewer 계정으로 CMK 상세 진입 | viewer | 정상 진입 |
| 2 | 우측 액션 영역 확인 | — | **서비스 해지** 버튼이 비활성 또는 노출되지 않음 |
| 3 | KMS User 계정으로 동일 검증 | user | 정책에 따라 차단 (요구사항 확인 필요) |

---

### 2.9 키 삭제 (영구)

#### TC-CMK-DELETE-001 — 키 삭제 정상

**Summary**: `[KMS] CMK · 키 영구 삭제`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Deletion
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 비활성 또는 해지된 CMK 키 1건 (이름: `delete-target`)

**Description**: 키 영구 삭제 흐름과 활동 로그 기록 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 비활성/해지 키 상세 → **삭제** 클릭 | — | 삭제 확인 모달 노출 |
| 2 | 키 이름 재입력 | `delete-target` | 이름 일치 시 **삭제** 버튼 활성화 |
| 3 | **삭제** 클릭 | — | • 리스트에서 제거<br>• 활동 로그에 삭제 이벤트 기록<br>• 다른 페이지에서도 활동 로그로 조회 가능 |

---

#### TC-CMK-DELETE-002 — 활성 키 삭제 제한 (Negative)

**Summary**: `[KMS] CMK · 활성 키 삭제 제한 (Negative)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / CMK / Deletion
**Labels**: `kms` `kms-2026-07` `negative`

**Pre-condition**: 활성 상태 CMK 키 1건

**Description**: 활성 상태에서는 삭제 액션이 차단되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 활성 상태 키 상세 진입 | — | 상세 페이지 로드 |
| 2 | **삭제** 액션 시도 | — | "활성 키는 비활성화 후 삭제할 수 있습니다" 안내 노출, 삭제 진행 불가 |

---

## 3. 플랫폼 관리형 키 (Platform Managed Key, PMK)

### 3.1 키 리스트 조회

#### TC-PMK-LIST-001 — 플랫폼 관리형 키 리스트

**Summary**: `[KMS] PMK · 리스트 정상 조회`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / PMK / List
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: 1건 이상의 PMK 존재

**Description**: PMK 리스트 컬럼 구성 및 CMK 와의 시각적 차이 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | GNB → **플랫폼 관리형 키** 진입 | — | PMK 리스트 화면 로드 |
| 2 | 테이블 컬럼 구성 확인 | — | 키 이름 / 서비스 매핑 / 상태 / 마지막 회전 / 생성일 |
| 3 | CMK 리스트와의 시각적 구분 확인 | — | 헤더 또는 행 뱃지로 PMK 임이 명확히 표시 |

---

#### TC-PMK-LIST-002 — 검색·필터

**Summary**: `[KMS] PMK · 리스트 검색 / 필터`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / PMK / List
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 다건의 PMK 존재

**Description**: 서비스명·상태 필터링과 칩 표시 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 서비스명 필터 적용 | `Storage` | 해당 서비스의 PMK 만 표시, 필터 칩 노출 |
| 2 | 상태 필터 추가 적용 | 활성 | 두 조건 모두 만족하는 키만 표시 |
| 3 | 칩의 X 클릭으로 필터 개별 해제 | — | 개별 해제 정상 |

---

### 3.2 키 상세 조회

#### TC-PMK-DETAIL-001 — 상세 페이지 표시

**Summary**: `[KMS] PMK · 상세 페이지 표시`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: High
**Components**: KMS / PMK / Detail
**Labels**: `kms` `kms-2026-07` `smoke` `functional`

**Pre-condition**: 1건 이상의 PMK 존재

**Description**: PMK 상세 페이지의 메타데이터·안내 배너·액션 비활성 여부 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 리스트에서 PMK 클릭 | — | 상세 페이지 진입 |
| 2 | 메타데이터 표시 확인 | — | 키 ID · 서비스 매핑 · 알고리즘 노출 |
| 3 | 안내 배너 확인 | — | "이 키는 플랫폼에서 자동으로 관리됩니다" 배너 노출 |
| 4 | 액션 영역 확인 | — | 생성 · 삭제 · 수동 회전 등 액션이 비활성 또는 비노출 |

---

#### TC-PMK-DETAIL-002 — 활동 로그 / 회전 이력

**Summary**: `[KMS] PMK · 활동 로그 / 회전 이력 표시`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / PMK / Detail
**Labels**: `kms` `kms-2026-07` `functional`

**Pre-condition**: 회전 이력이 1건 이상 있는 PMK

**Description**: 활동 로그 또는 회전 이력 탭의 정렬 및 라벨 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 상세 → 활동 로그 또는 회전 이력 탭 진입 | — | 탭 내용 로드 |
| 2 | 정렬 순서 확인 | — | 시간순(역순) 정렬 |
| 3 | 회전 이벤트 라벨 확인 | — | "auto-rotation" 라벨로 자동 회전 이벤트가 구분되어 표시 |

---

### 3.3 권한 / 노출

#### TC-PMK-PERM-001 — Viewer 권한 노출

**Summary**: `[KMS] PMK · Viewer 권한 노출 차이`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / PMK / Permission
**Labels**: `kms` `kms-2026-07` `permission`

**Pre-condition**: Viewer 권한 계정 / 1건 이상의 PMK

**Description**: Viewer 권한에서 조회는 가능하나 다운로드/내보내기는 차단되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | Viewer 계정으로 PMK 리스트 진입 | viewer | 리스트 조회 가능 |
| 2 | PMK 상세 진입 | — | 상세 조회 가능 |
| 3 | 다운로드 / 내보내기 액션 확인 | — | 액션이 비활성화 상태 |

---

#### TC-PMK-PERM-002 — 직접 조작 시도 차단 (Negative)

**Summary**: `[KMS] PMK · 직접 조작 시도 차단 (Negative)`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / PMK / Permission
**Labels**: `kms` `kms-2026-07` `negative` `permission`

**Pre-condition**: KMS Admin 권한 계정 (정상 흐름이 아닌 강제 액션 시도)

**Description**: URL 직접 조작이나 API 흉내로 삭제·수동 회전을 시도해도 차단되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | PMK 삭제 URL 직접 입력 | `/kms/pmk/{id}/delete` | UI 진입 자체 차단 또는 403 에러 |
| 2 | 수동 회전 API 호출 흉내 (DevTools) | POST rotate | "이 키는 플랫폼이 관리합니다" 에러 응답 |
| 3 | 화면에서 흔적 확인 | — | 정상 사용자에게는 UI 상에서 해당 액션 자체가 노출되지 않음 |

---

### 3.4 빈 상태 / 다국어

#### TC-PMK-EMPTY-001 — PMK Empty State

**Summary**: `[KMS] PMK · 0건 상태 Empty View`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Low
**Components**: KMS / PMK / List
**Labels**: `kms` `kms-2026-07` `empty-state`

**Pre-condition**: PMK 가 0건인 신규 환경

**Description**: PMK 0건 상태에서 안내 텍스트 노출 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | PMK 리스트 진입 | — | "현재 사용 중인 플랫폼 관리형 키가 없습니다" 안내 노출 |

---

#### TC-PMK-I18N-001 — 한글·영문 라벨 일관성

**Summary**: `[KMS] PMK · 한글 / 영문 라벨 일관성`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Low
**Components**: KMS / PMK / Detail
**Labels**: `kms` `kms-2026-07` `i18n`

**Pre-condition**: 1건 이상의 PMK / 언어 토글 사용 가능

**Description**: 한국어 ↔ 영어 모드 전환 시 번역 누락·잘림이 없는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | 한국어 모드에서 PMK 상세 진입 | ko | 모든 라벨이 한국어로 표기 |
| 2 | 영어 모드로 토글 | en | 모든 라벨이 영어로 전환, 번역 누락 없음 |
| 3 | 영어 모드에서 줄바꿈/잘림 확인 | — | 어떤 영문 라벨도 줄바꿈 깨짐 / 잘림 발생 없음 |

---

## 4. 교차 시나리오 (Cross-feature)

### TC-X-001 — 키 종류 간 네비게이션

**Summary**: `[KMS] Cross · CMK ↔ PMK 네비게이션 상태 유지`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Cross-feature
**Labels**: `kms` `kms-2026-07` `cross-feature`

**Pre-condition**: CMK / PMK 각 1건 이상

**Description**: 두 키 종류 간 이동 시 페이지 상태(필터/스크롤) 보존 및 GNB 강조 정확성 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | CMK 리스트에서 필터 적용 후 스크롤 | filter:활성 | 결과 표시 |
| 2 | GNB → PMK 진입 후 다시 GNB → CMK | — | • 이전 필터/스크롤 상태가 합리적으로 보존<br>• 활성 GNB 메뉴가 정확하게 강조 |

---

### TC-X-002 — 활동 로그 일관성

**Summary**: `[KMS] Cross · CMK / PMK 활동 로그 일관성`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Cross-feature
**Labels**: `kms` `kms-2026-07` `cross-feature`

**Pre-condition**: CMK · PMK 각각에서 1건 이상의 이벤트 발생 (생성/회전 등)

**Description**: 통합 활동 로그 또는 각 상세 활동 로그에서 동일 이벤트가 일관된 포맷으로 표시되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | CMK 상세에서 활동 로그 확인 | — | 이벤트 ID / 행위자 / 시각 / 액션 / 대상 표기 |
| 2 | PMK 상세에서 활동 로그 확인 | — | 동일한 컬럼 포맷으로 표시 |
| 3 | 통합 로그(있을 경우)에서 두 이벤트 모두 조회 | — | 필터·검색으로 양쪽 이벤트 모두 조회 가능 |

---

### TC-X-003 — 동시 편집 충돌

**Summary**: `[KMS] Cross · 동일 키 동시 편집 충돌 안내`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Cross-feature
**Labels**: `kms` `kms-2026-07` `cross-feature`

**Pre-condition**: 동일 CMK 를 편집 가능한 권한 계정 2개 / 두 브라우저 세션 준비

**Description**: 두 세션에서 동일 키의 설명을 동시 수정 후 저장 시 나중 저장 측에 충돌 안내가 노출되는지 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | A 세션과 B 세션에서 동일 CMK 의 설명 편집 시작 | — | 두 세션 모두 편집 상태 진입 |
| 2 | A 세션이 먼저 저장 | A: `A-edited` | 정상 저장 |
| 3 | B 세션이 저장 시도 | B: `B-edited` | "이미 변경되었습니다. 새로 불러와 주세요" 안내 + 저장 차단 |

---

### TC-X-004 — 세션 만료 처리

**Summary**: `[KMS] Cross · 세션 만료 후 작업 복귀`
**Issue Type**: Test · **Test Type**: Manual · **Priority**: Medium
**Components**: KMS / Cross-feature
**Labels**: `kms` `kms-2026-07` `cross-feature`

**Pre-condition**: 세션 idle 타임아웃이 짧게 설정된 테스트 환경 또는 세션 만료 강제 가능

**Description**: 장시간 idle 후 키 수정 시도 시 만료 안내 모달 → 재인증 → 작업 복귀 흐름 검증.

**Steps**:

| # | Action | Data | Expected Result |
|---|--------|------|-----------------|
| 1 | CMK 상세에 진입 후 세션 만료 시각까지 idle 유지 | — | 세션 만료 |
| 2 | 설명 수정 시도 | — | 만료 안내 모달 노출 |
| 3 | 모달의 **재로그인** 클릭 → 인증 완료 | — | 원래 작업 화면으로 복귀, 입력값 보존 (가능한 경우) |

---

## 5. UI/UX 시각 검증 체크리스트 (참고)

> 각 TC 의 UI 검증 항목과 별개로, 화면 단위로 일괄 점검할 수 있는 체크리스트입니다. Xray 의 별도 Test 로 등록하지 않고 본 절을 **테스트 실행 시 가이드**로 활용하세요.

### 5.1 레이아웃

- [ ] 모든 페이지의 사이드바·헤더 고정 동작이 일관됨
- [ ] 컨텐츠 영역 최소/최대 폭(1280–1600px)에서 가독성 유지
- [ ] 카드·테이블의 패딩·여백이 디자인 토큰과 일치

### 5.2 색상·타이포

- [ ] Primary / Danger / Success / Warning 컬러 사용처가 일관
- [ ] 본문 14px / 보조 12px / 제목 18~24px 위계 유지
- [ ] 다크 모드의 배경 대비가 WCAG AA 만족

### 5.3 상태 표시

- [ ] 활성 / 비활성 / 해지됨 / 해지 예약 / 삭제 진행 중 배지 색상·아이콘이 구분됨
- [ ] 로딩 스켈레톤이 ≥300ms 작업 시 노출
- [ ] 빈 상태 / 에러 상태에 일관된 일러스트 사용

### 5.4 인터랙션

- [ ] 모든 모달은 ESC 키 + 외부 영역 클릭으로 닫힘 (위험 액션 모달 제외)
- [ ] 토스트는 4초 후 자동 사라짐 + 수동 닫기 가능
- [ ] 폼 제출 중에는 버튼이 로딩 상태(spinner)로 전환되고 중복 클릭 방지

### 5.5 접근성

- [ ] 모든 인터랙티브 요소의 Tab 순서가 자연스러움
- [ ] 스크린리더용 `aria-label` 설정
- [ ] 색상만으로 상태를 전달하지 않음 (텍스트/아이콘 병행)

---

## 6. 회귀 테스트 우선순위 (Smoke Set)

다음 9개 TC 는 매 빌드마다 우선 수행 — Xray 의 **Test Set** 으로 묶어두면 편리합니다.

| # | TCID | Summary |
| --- | --- | --- |
| 1 | TC-SH-001 | 서비스 홈 정상 진입 |
| 2 | TC-CMK-LIST-001 | CMK 리스트 정상 조회 |
| 3 | TC-CMK-CREATE-001 | CMK 키 생성 (필수 필드만) |
| 4 | TC-CMK-DETAIL-001 | CMK 상세 페이지 정보 표시 |
| 5 | TC-CMK-STATE-001 | CMK 키 비활성화 (재확인) |
| 6 | TC-CMK-ROTATE-001 | CMK 자동 회전 활성화 |
| 7 | TC-CMK-TERM-001 | CMK 서비스 즉시 해지 |
| 8 | TC-PMK-LIST-001 | PMK 리스트 정상 조회 |
| 9 | TC-PMK-DETAIL-001 | PMK 상세 페이지 표시 |

---

## 7. 미정 / 추가 확인 필요 (Open Questions)

> Figma MCP 호출 한도 도달로 모든 프레임을 세부 분석하지는 못했습니다. 아래 항목은 디자인 원본을 추가 확인하여 시나리오를 보강할 필요가 있습니다.

1. **Service Home 위젯 구성** — 정확한 카드 종류 / 데이터 항목 / CTA 명칭
2. **CMK "버전" 탭** — 키 버전(회전 이력) UI 와 가능한 액션 (수동 회전 여부 등)
3. **태그·라벨링 규칙** — 키 생성 시 태그 입력 규칙 (개수 제한, 키-값 형식 등)
4. **다국어 지원 범위** — 영어 외 추가 언어 지원 여부
5. **알림 채널** — 키 해지 예약 / 자동 회전 알림 발송 채널 (이메일/팝업/기타)
6. **감사 로그 보존 기간** — 활동 로그 보존 기간

위 항목들이 확정되면 본 문서에 추가 케이스(예: TC-CMK-VERSION-* / TC-CMK-TAG-* / TC-NOTIFY-*)를 보강할 수 있습니다.

---

*문서 끝. 변경 이력은 별도 관리.*

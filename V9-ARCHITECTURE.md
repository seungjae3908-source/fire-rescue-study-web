# 119 v9 Architecture

Status: development branch only. Production v8.6 stays unchanged until all v9 release gates pass.

## Goals

- One learning task per screen, no horizontal scrolling.
- Desktop: small global navigation + wide learning workspace.
- Study TOC is a drawer, not a permanent third/fourth column.
- Study content uses one internal vertical scroll.
- `119 / 관련문제 / 공식근거` is a fixed learning action bar.
- Mobile keeps `홈 / 학습 / AI / 문제 / 전체`, with the study action bar above mobile navigation.
- Public official curriculum is separated from private member data.
- Personal PDFs, OCR, notes, wrong answers, progress and tutor context are private by default.
- Free/local AI only. No paid model fallback.
- No Replit.

## Data boundaries

### Public / shared application data
- curriculum taxonomy
- official source map
- verified Concept Packs
- verified A/B question bank
- common exam rules

### Private member data
- profile and exam target
- concept mastery/progress
- answer history and confidence
- wrong answers and review schedule
- personal notes
- personal document metadata/chunks
- study sessions
- exam history
- tutor preferences/context

The browser uses a stable guest identity when signed out. Guest data is local-only. On sign-in, guest records are merged into the authenticated user's namespace, then optional cloud sync runs.

## Privacy model

1. Personal documents are processed locally first.
2. Original files are not uploaded automatically.
3. Cloud original-file sync is opt-in only.
4. Member tables use DB-side RLS (`auth.uid() = user_id`).
5. Private storage is non-public and path-scoped to `/<user_uuid>/...`.
6. No cross-user sharing path exists in v9 schema.
7. The investment-app backend must never be reused.

## Mastery model

Per concept, v9 records correctness, confidence, response time, repeated wrong answers, last study, next review and review outcome.

Priority order for Today Study:
1. confident-wrong misconceptions
2. overdue reviews
3. low-mastery studied concepts
4. unresolved wrong answers
5. new concepts

Spaced-review base intervals: same day after a miss, then 1 / 3 / 7 / 14 / 30 days according to mastery.

## Mock-exam integrity

Real mock exam is fail-closed. It opens only when at least 25 distinct verified fire questions and 40 distinct verified EMS questions exist. Questions are never cloned to fake 65 items. Until then the UI exposes a clearly labeled practice mode.

## Source truth

The 2026 baseline has 135 Concept IDs:
- Fire science: 28
- EMS: 107

Every concept has an official source range. A Concept Pack can show detailed claims only after official-source verification. Unverified packs show the source range and remain locked instead of inventing details.

## Release gates

- 135/135 detailed Concept Packs verified from official sources
- 25 distinct fire + 40 distinct EMS verified questions minimum for real mock exam
- member backend is a dedicated 119 project
- RLS isolation tests pass with two separate test users
- private storage access tests pass
- guest -> member migration passes
- personal PDF/OCR regression passes
- PC/mobile no-horizontal-scroll QA passes
- PWA/cache update test passes
- wrong-answer -> concept-treatment -> re-test flow passes
- runtime errors = 0

Only after all gates pass should root `index.html` switch from v8.6 to v9.


## Release CI

V9 release verification runs on pull requests and on pushes to both `feat/v9-learning-workspace` and `main`.

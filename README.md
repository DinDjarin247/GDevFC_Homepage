# G DEV. F.C. Homepage

레트로 아케이드 콘솔 컨셉의 게임 개발 동아리 홈페이지.
Next.js 15 App Router + 정적 export(`output: 'export'`)로 빌드되며, 서버 없이 어디서나 호스팅할 수 있습니다.

## 실행

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

빌드 결과는 `out/` 에 순수 HTML/CSS/JS 로 생성됩니다. GitHub Pages, Netlify, Vercel, S3 등에 그대로 올리면 됩니다.

## 화면 구성

| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | 타이틀 | `PRESS START` — 클릭 또는 Enter/Space |
| `/select` | SELECT MODE | 3개 모드 카드 캐러셀 (← → 이동, Enter 진입, 스와이프) |
| `/about` | ABOUT | 동아리 소개 · HISTORY · ACTIVITIES · CONTACT |
| `/showcase` | SHOWCASE | 프로젝트 슬롯 6칸 (← → 이동, 스와이프) |
| `/join` | JOIN THE PARTY | Formspree 연동 지원 폼 |

## 콘텐츠 수정 — `data/*.json`

모든 텍스트와 목록은 JSON에 있습니다. 컴포넌트를 건드릴 필요가 없습니다.

| 파일 | 내용 |
|---|---|
| `data/site.json` | 사이트 타이틀, 태그라인, 상단 시스템 바 문구, 메타 정보 |
| `data/modes.json` | SELECT MODE 카드 3종 (라벨 · 링크 · 이미지 · 스프라이트) |
| `data/about.json` | 소개 문구, HISTORY 연혁, ACTIVITIES 태그, CONTACT 링크 |
| `data/showcase.json` | 프로젝트 슬롯 목록과 NO DATA 안내 문구 |
| `data/join.json` | 지원 자격/절차 안내, 폼 필드, Formspree 엔드포인트, 완료 메시지 |

### 프로젝트 슬롯 채우기

`data/showcase.json` 의 슬롯은 기본값이 전부 `null` 이라 **NO DATA** 상태로 표시됩니다.
값을 채우면 자동으로 실제 프로젝트 카드로 바뀝니다.

```json
{
  "id": "slot-01",
  "title": "프로젝트명",
  "summary": "한 줄 소개",
  "genre": "액션 로그라이크",
  "period": "2025.03 – 2025.08",
  "image": "/images/project-01.png"
}
```

슬롯 개수는 배열 길이를 늘리거나 줄이면 됩니다. 우측 상단 카운터(`01/06`)와 하단 도트가 자동으로 따라갑니다.

### 캐릭터 카드 이미지

`data/modes.json` 의 `image` 가 `null` 이면 `components/Sprite.tsx` 의 내장 픽셀 스프라이트(기사 · 마법사 · 궁수)가 렌더링됩니다.
직접 만든 도트 아트를 쓰려면 `public/images/` 에 넣고 경로를 지정하세요.

```json
{ "id": "about", "image": "/images/mode-about.png", "sprite": "knight" }
```

이미지 로딩에 실패하면 자동으로 내장 스프라이트로 되돌아갑니다.

## 지원 폼 (Formspree)

엔드포인트는 `data/join.json` 의 `formspreeEndpoint` 에 있습니다.

```json
"formspreeEndpoint": "https://formspree.io/f/xoeaaddw"
```

제출은 `fetch` 로 비동기 전송되며, 페이지 이동 없이 **`▸ ENTRY SAVED`** 확인 화면으로 전환됩니다.
전송 실패 시 에러 문구가 뜨고 입력값은 유지됩니다.

폼 필드는 `data/join.json` 의 `form.fields` 배열로 정의합니다. 항목을 추가하면 그대로 렌더링됩니다.

```json
{ "name": "portfolio", "label": "포트폴리오 링크", "type": "url", "placeholder": "https://", "required": false }
```

`type: "select"` 인 경우 `options` 배열이 선택지가 됩니다.

## 디자인 토큰

색상·폰트·간격은 `app/globals.css` 의 CSS 변수에 모여 있습니다.

```css
--bg: #0b0b0b;        /* 딥 차콜 배경 */
--panel: #191919;     /* 콘솔 패널 */
--lime: #c9f73d;      /* 메인 액센트 */
--magenta: #ff2f8f;   /* 보조 액센트 */
```

타이틀의 마젠타 색수차는 `text-shadow: -3px 0 0 var(--magenta)` 로 구현되어 있습니다.
스캔라인은 `components/Frame.module.css` 의 `repeating-linear-gradient` 입니다.

## 폰트

- **Press Start 2P** (Google Fonts) — 영문 픽셀 헤딩
- **DM Mono** (Google Fonts) — 시스템 바, 캡션
- 한글은 Pretendard → 시스템 고딕 순으로 폴백

`▸` `▪` `【 】` 같은 글리프는 Press Start 2P에 없어 본문 폰트로 따로 렌더링합니다.

## 조작

| 키 | 동작 |
|---|---|
| `Enter` / `Space` | PRESS START (타이틀) |
| `←` `→` | 카드 · 슬롯 이동 |
| `Enter` | 선택한 모드로 진입 |

입력 필드에 포커스가 있을 때는 단축키가 동작하지 않습니다 (`lib/useArcadeKeys.ts`).
모바일에서는 좌우 스와이프를 지원합니다.

## 구조

```
app/
  page.tsx            타이틀
  select/             SELECT MODE
  about/              ABOUT
  showcase/           SHOWCASE
  join/               JOIN THE PARTY
  globals.css         디자인 토큰
components/
  Frame.tsx           패널 · 배지 · 스캔라인 셸
  SysBar.tsx          상단 시스템 바
  ScreenHeader.tsx    BACK / 타이틀 / 상태
  ModeCarousel.tsx    모드 선택 캐러셀
  JoinForm.tsx        Formspree 폼
  Sprite.tsx          내장 픽셀 스프라이트
data/                 모든 콘텐츠 (JSON)
lib/
  types.ts            JSON 스키마 타입
  useArcadeKeys.ts    키보드 조작 훅
```

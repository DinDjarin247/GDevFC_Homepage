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
| `/about` | ABOUT | 매니페스토 히어로 · SEASON 1 · HISTORY · ACTIVITIES · CONTACT |
| `/showcase` | SHOWCASE | 프로젝트 슬롯 6칸 (← → 이동, 스와이프) |
| `/join` | JOIN THE PARTY | RPG 캐릭터 생성 컨셉 지원 폼 (실시간 카드 미리보기) |

프레임은 항상 뷰포트를 가득 채우며, 내부 콘텐츠만 `--content-max` 로 폭이 제한됩니다.

## 콘텐츠 수정 — `data/*.json`

모든 텍스트와 목록은 JSON에 있습니다. 컴포넌트를 건드릴 필요가 없습니다.

| 파일 | 내용 |
|---|---|
| `data/site.json` | 사이트 타이틀, 태그라인, 상단 시스템 바 문구, 메타 정보 |
| `data/modes.json` | SELECT MODE 카드 3종 (라벨 · 링크 · 이미지 · 스프라이트) |
| `data/about.json` | 히어로 문구, SEASON 1 매니페스토, HISTORY, ACTIVITIES, CONTACT |
| `data/showcase.json` | 프로젝트 슬롯 목록과 NO DATA 안내 문구 |
| `data/join.json` | 캐릭터 생성 필드, CLASS/장르 목록, Formspree 엔드포인트, 완료 메시지 |

### ABOUT 히어로 문구

`data/about.json` 의 `hero.lines` 가 순차 등장하는 매니페스토입니다.
`text` 배열의 각 원소가 한 줄이 되고, `tone` 이 색을 결정합니다 (`off` 오프화이트 · `lime` · `magenta`).
화면을 클릭하면 애니메이션을 건너뛰고 전체가 즉시 표시됩니다.

### 지원 폼 CLASS 추가

`data/join.json` 의 `classes` 배열에 항목을 넣으면 카드형 버튼과 미리보기 색이 함께 늘어납니다.

```json
{ "id": "writer", "label": "시나리오", "en": "WRITER", "icon": "✎", "color": "#ffb347" }
```

`color` 는 선택 시 카드 테두리 · 아바타 · 장르 칩에 그대로 반영됩니다.

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

제출은 `fetch` 로 비동기 전송되며, 페이지 이동 없이 **`▸ CHARACTER SAVED`** 확인 화면으로 전환됩니다.
전송 실패 시 에러 문구가 뜨고 입력값은 유지됩니다.

전송되는 키는 `name` · `playerId` · `class` · `favoriteGame` · `genre` · `originStory` · `inventory` 입니다.
INVENTORY 는 파일 업로드가 아니라 **URL 텍스트**로만 전송됩니다 (무료 플랜은 첨부를 지원하지 않음).

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
- **Galmuri** (jsDelivr) — 한글 픽셀 폰트. Press Start 2P 에 한글 글리프가 없어 필요합니다
- **DM Mono** (Google Fonts) — 시스템 바, 캡션
- 본문 한글은 Pretendard → 시스템 고딕 순으로 폴백

`--font-pixel` 은 `'Press Start 2P', 'Galmuri11'` 순으로 지정돼 있어, 글리프 단위 폴백으로
영문은 Press Start 2P · 한글은 Galmuri 로 각각 렌더링됩니다. 히어로처럼 큰 텍스트는
`--font-pixel-lg` (Galmuri14) 를 씁니다.

`▸` `▪` `◂` `【 】` 같은 글리프는 어느 픽셀 폰트에도 없어 본문 폰트로 따로 렌더링합니다.

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
  Frame.tsx             패널 · 배지 · 스캔라인 셸 (뷰포트 전체를 채움)
  SysBar.tsx            상단 시스템 바
  ScreenHeader.tsx      BACK / 타이틀 / 상태
  ModeCarousel.tsx      모드 선택 캐러셀
  AboutHero.tsx         매니페스토 순차 등장 + 클릭 스킵
  CharacterCreator.tsx  캐릭터 생성 폼 + 실시간 카드 미리보기
  Sprite.tsx            내장 픽셀 스프라이트 (기사 · 마법사 · 엘프 아처)
data/                 모든 콘텐츠 (JSON)
lib/
  types.ts            JSON 스키마 타입
  useArcadeKeys.ts    키보드 조작 훅
```

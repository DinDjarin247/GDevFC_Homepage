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
| `/` | 타이틀 | `PRESS START` — 클릭 또는 Enter/Space. 배경에 반짝이는 스타필드 + 우주선 |
| `/select` | SELECT MODE | 모드 카드 캐러셀 (← → 이동, Enter 진입, 스와이프). 실제 4개 + 잠긴 예고 카드 |
| `/about` | ABOUT | 매니페스토 히어로 · SEASON 1 · HISTORY · ACTIVITIES · CONTACT |
| `/showcase` | SHOWCASE | 프로젝트 슬롯 6칸 (← → 이동, 스와이프) |
| `/join` | JOIN THE PARTY | RPG 캐릭터 생성 컨셉 지원 폼 (실시간 카드 미리보기) |
| `/play` | PLAY | "달려라 우왕이" 미니게임 — 교실 탈출 + 횡스크롤 러닝 |

프레임은 항상 뷰포트를 가득 채우며, 내부 콘텐츠만 `--content-max` 로 폭이 제한됩니다.
`/play` 처럼 그 제한 없이 패널 폭 전체를 써야 하는 화면은 `<Frame fullBleedBody>` 를 씁니다.
`fullBleedBody` 는 동시에 `.page` 에 실제 높이(`height:100dvh`)를 씌워, 내부에 자체
스크롤 영역(예: 인트로 화면)이 있는 페이지에서 그 스크롤이 문서 전체 스크롤로 새는
문제를 막습니다 — `min-height` 만으로는 상한이 없어 flex 자식들이 그냥 늘어나 버립니다.
홈 화면의 스타필드처럼 헤더까지 포함해 패널 전체를 채우는 배경은 `<Frame background={...}>` 로 넣습니다.

## 콘텐츠 수정 — `data/*.json`

모든 텍스트와 목록은 JSON에 있습니다. 컴포넌트를 건드릴 필요가 없습니다.

| 파일 | 내용 |
|---|---|
| `data/site.json` | 사이트 타이틀, 태그라인, 상단 시스템 바 문구, 메타 정보 |
| `data/modes.json` | SELECT MODE 카드 3종 (라벨 · 링크 · 이미지 · 스프라이트) |
| `data/about.json` | 히어로 문구, SEASON 1 매니페스토, HISTORY, ACTIVITIES, CONTACT |
| `data/showcase.json` | 프로젝트 슬롯 목록과 NO DATA 안내 문구 |
| `data/join.json` | 캐릭터 생성 필드, CLASS/장르 목록, Formspree 엔드포인트, 완료 메시지 |
| `data/play.json` | 미니게임 인트로 문구, 조작법, 페이즈 설명, 가로모드 안내, 게임오버 문구 |

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

`data/modes.json` 의 `image` 가 `null` 이면 `components/Sprite.tsx` 의 내장 픽셀 스프라이트(기사 · 마법사 · 엘프 아처 · 우왕이)가 렌더링됩니다.
직접 만든 도트 아트를 쓰려면 `public/images/` 에 넣고 경로를 지정하세요.

```json
{ "id": "about", "image": "/images/mode-about.png", "sprite": "knight" }
```

이미지 로딩에 실패하면 자동으로 내장 스프라이트로 되돌아갑니다.

### SELECT MODE 잠긴("예고") 카드

`data/modes.json` 의 모드 항목에 `"locked": true` 를 주면 실루엣 + `???` + 호버 시
`comingSoonLabel` 문구만 보여주고 클릭해도 진입하지 않는 카드가 됩니다. `href` 는 `null` 로 둡니다.

```json
{ "id": "locked-3", "no": "07", "label": "???", "href": null, "image": null, "sprite": "mystery", "alt": "잠긴 모드", "locked": true }
```

## 지원 폼 (Formspree)

엔드포인트는 `data/join.json` 의 `formspreeEndpoint` 에 있습니다.

```json
"formspreeEndpoint": "https://formspree.io/f/xoeaaddw"
```

제출은 `fetch` 로 비동기 전송되며, 페이지 이동 없이 **`▸ CHARACTER SAVED`** 확인 화면으로 전환됩니다.
전송 실패 시 에러 문구가 뜨고 입력값은 유지됩니다.

전송되는 키는 `name` · `playerId` · `class` · `favoriteGame` · `genre` · `originStory` · `inventory` 입니다.
INVENTORY 는 파일 업로드가 아니라 **URL 텍스트**로만 전송됩니다 (무료 플랜은 첨부를 지원하지 않음).

## 미니게임 — 달려라 우왕이 (`/play`)

Canvas 2D 로 그리는 두 페이즈 구성 미니게임입니다. 무거운 라이브러리 없이
저해상도 가상 캔버스(320×180)를 CSS/JS 로 화면에 맞춰 확대하는 방식이라 가볍습니다.

- **페이즈 1 — 교실 탈출**: 교수님이 칠판을 보는 동안(SAFE)에만 `Space`/탭을
  누른 채로 왼쪽 문까지 이동. 학생 쪽을 볼 때(DANGER) 이동하면 처음부터 다시.
- **페이즈 2 — 횡스크롤 러닝**: 자동 스크롤, `Space`/탭으로 점프, `↓`/아래로
  스와이프로 숙이기. 장애물 3종(점프용 · 숙이기용 · 하트) 랜덤 생성, 목숨 3개.
  시간이 지날수록(약 40초에 걸쳐) 스크롤 속도가 오르고, 스폰 간격이 좁아지며,
  일정 확률로 장애물이 바로 이어 붙는 콤보가 나와 갈수록 빡빡해집니다.
- **게임오버**: 점수 · 최고기록을 캔버스에 직접 그려서 `▸ CAPTURE RECORD` 버튼으로
  `canvas.toDataURL()` 캡처 이미지를 다운로드할 수 있습니다(서버 저장 없음).
- **최고기록**: `localStorage` 키 `gdevfc_woowang_best` 에 로컬로만 저장됩니다.
  전체 공개 리더보드는 없습니다.
- **모바일 가로모드 안내**: 세로로 들면 `components/play/RotateGate.tsx` 가
  "가로모드로 돌려주세요" 안내로 콘텐츠를 대체합니다(`@media (orientation: portrait)`).
  Screen Orientation Lock API 는 iOS Safari 가 지원하지 않아 쓰지 않았습니다.
- **모바일 전체화면**: 게임이 시작되면(`started === true`) `<Frame immersiveMobile>`
  이 좁은 화면(≤820px)에서만 배지·헤더·여백·테두리를 없애 캔버스가 뷰포트를
  그대로 채웁니다. 헤더의 BACK 링크가 사라지므로 캔버스 좌상단에 별도의
  `✕` 나가기 버튼(`.exitBtn`, 같은 breakpoint 에서만 보임)을 둡니다.
  데스크톱은 전혀 영향받지 않습니다.

물리감(점프 높이, 장애물 간격, 난이도 상승 속도)은 `components/play/WoowangGame.tsx`
상단의 상수(`JUMP_V`, `GRAVITY`, `BASE_SPEED`, `ACCEL` 등)로 1차로 대략 맞춰둔
값입니다. 플레이해보고 조정하면 됩니다.

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
  page.tsx            타이틀 (배경: Starfield)
  select/             SELECT MODE
  about/              ABOUT
  showcase/           SHOWCASE
  join/               JOIN THE PARTY
  play/               PLAY 미니게임 (fullBleedBody)
  globals.css         디자인 토큰
components/
  Frame.tsx             패널 · 배지 · 스캔라인 셸 (뷰포트 전체를 채움)
  SysBar.tsx            상단 시스템 바
  ScreenHeader.tsx      BACK / 타이틀 / 상태
  ModeCarousel.tsx      모드 선택 캐러셀 (잠긴 카드 포함)
  AboutHero.tsx         매니페스토 순차 등장 + 클릭 스킵
  CharacterCreator.tsx  캐릭터 생성 폼 + 실시간 카드 미리보기
  Sprite.tsx            내장 픽셀 스프라이트 (기사 · 마법사 · 엘프 아처 · 우왕이 · 미스터리)
  Starfield.tsx         홈 화면 배경 — 반짝이는 스타필드 + 우주선
  play/
    IntroScreen.tsx     레트로 타이틀 카드 (스크롤 끝까지 내려야 시작 활성화)
    WoowangGame.tsx     Canvas 게임 엔진 (페이즈1·2 + 게임오버 + 캡처)
    RotateGate.tsx      모바일 세로 방향일 때 "가로로 돌려주세요" 안내
data/                 모든 콘텐츠 (JSON)
lib/
  types.ts            JSON 스키마 타입
  useArcadeKeys.ts    키보드 조작 훅
```

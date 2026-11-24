# 인수인계 — 2026-11-24

다른 노트북 · 새 세션에서 이어서 작업하기 위한 메모. 새 Claude Code 세션을 열면 **이 파일을 먼저 읽으라고** 하면 된다.

- 사이트: https://g-dev-fc-homepage.vercel.app
- 저장소: `DinDjarin247/GDevFC_Homepage`, 브랜치 `main` (푸시하면 Vercel 이 자동 배포)
- 마지막 코드 커밋 `0d21760` 까지 배포 확인함 — 광장(`/select`)이 콘솔 오류 없이 뜬다 (2026-11-24)

## 0. 지금 상태 한 줄 요약

광장(`/select`)을 구도부터 새로 만들어 배포했고, **사용자의 감상 · 수정 요청을 아직 못 받았다.**
다음 세션은 (1) 광장 피드백 반영, (2) 남은 화면(아래 1번 표)을 같은 방식으로 바꾸기 순서로 가면 된다.

## 1. 픽셀 아트 대공사 — 광장은 끝, 나머지가 남았다

### 끝난 것: 광장(`/select`) 전면 교체 (2026-11-24)

구도부터 새로 짰다 — **언덕 도시의 계단 광장**. 앞은 분수가 있는 아래 광장, 가운데 큰 계단 위에
시계탑 문루가 선 윗마당, 그 뒤로 윗마을 · 절벽 위의 성 · 돌다리 · 폭포 · 하늘의 용.
배경 · 소품 · 마을 사람 16종(31명) · 주인공 7명 · 시간대 6종을 한 번에 바꿨다.

- 만드는 곳: `art/plaza/*.js` (Node 스크립트), 굽기: `npm run art` → `public/art/plaza/*.png` + `lib/plazaArt.ts`
- 화면: `components/PlazaScene.tsx` (조각을 겹치고 움직이는 것만 그린다), `components/HeroSprite.tsx`
- 자리 옮기기: `art/plaza/placement.js` 만 고치고 다시 굽는다
- 자세한 표는 [README.md](README.md) 의 "SELECT MODE — 계단 광장"

`art/plaza/` 파일별 역할:

| 파일 | 무엇 |
|---|---|
| `kit.js` | 재질 · 색 단계 · `Mat` (재질 번호 + 밝기로 그리는 캔버스) · 벽/지붕 무늬 |
| `layout.js` | 화면의 뼈대 좌표 (윗마당 높이, 계단, 분수, 버팀벽) |
| `buildings.js` · `landmarks.js` · `town.js` | 집 생성기 · 시계탑 문루 · 윗마당의 집 배치 |
| `backdrop.js` | 먼 산 · 성 · 돌다리 · 폭포 · 윗마을 언덕 |
| `ground.js` | 윗마당 · 옹벽 · 난간 · 큰 계단 · 아래 광장 바닥 |
| `props.js` | 분수 · 천막 · 좌판 · 소파 · TV · 과녁 · 수레 등 소품 |
| `npcs.js` | 사람 생성기 `figure` 와 마을 사람 16종 |
| `heroes.js` | 주인공 7명 (같은 생성기 + 옷 · 소지품) |
| `effects.js` | 불꽃 · 연기 · 폭포 · 용 · 깃발 · 구름 · 나무 흔들림 프레임 |
| `grade.js` | 시간대 6종의 색 보정 · 하늘 · 등불 빛 |
| `placement.js` | **소품 · 마을 사람 · 주인공이 서는 자리** (가장 자주 고칠 파일) |
| `build.js` | 전부 모아 굽는다. `PHASE=noon,night npm run art` 로 일부만 구울 수 있다 (이때는 `lib/plazaArt.ts` 를 안 쓴다) |
| `try-props.js` · `try-npcs.js` | 소품 · 사람만 따로 뽑아 보는 미리보기 |

`lib/plazaArt.ts` 는 굽기가 만드는 파일이다 — **손으로 고치지 말 것.** 미리보기는 `art/preview/` 에 생긴다 (git 제외).

방식 (다음 화면에도 그대로 쓴다):

- 색을 바로 찍지 않고 **재질 번호 + 밝기**로 그린 뒤, 재질마다 준비한 색 단계(어두울수록 푸르게, 밝을수록
  누렇게)에서 색을 고른다 (`art/plaza/kit.js` 의 `Mat`). 그늘이 탁해지지 않는다.
- 그림은 전부 한낮 기준. 시간대는 굽는 단계에서 색을 바꾸고(`grade.js`), 등불 주변만 따뜻한 원래 색으로 되돌린다.
- 사람은 부위별로 다시 그린다 (`npcs.js` 의 `figure`). 걷기 4 + 말하기 2 프레임, 거리별 3가지 크기를
  줄이지 않고 각각 그린다. 주인공도 같은 생성기에 옷 · 소지품만 덧붙였다 (`heroes.js`).
- 주인공 레퍼런스는 옷 · 색 · 자세만 따랐다 (그림을 그대로 변환하지 않았다 — 저작권 걱정이 없다).
  우왕이만 학교 캐릭터 그림을 픽셀로 옮긴 것이다 (`art/refs-pixel/woowang-64.png`, 64px 로 확정).

### 확인한 범위

- 배포 사이트 `/select`: 데스크톱(1440x810) · 모바일(375x812) 에서 콘솔 오류 없음, 주인공 7명 표시, 그림 6장 로드
- 실제 브라우저에서 돌려 본 시간대: 한낮 · 밤 · 오후. **새벽 · 아침 · 저녁은 구운 미리보기 그림으로만 봤다**
- `npx tsc --noEmit` 통과. 로컬 `next build` 는 이 PC 에서 못 돌렸다 (아래 4번)

### 알려진 문제 · 손볼 곳

- 화면 아래 "PRESS START" 안내 문구가 바드(갤러리)의 발과 겹친다
- 주인공은 생성기로 그린 옆모습이라 레퍼런스 그림과 인상이 다를 수 있다 — 닮게 고치려면 `heroes.js`
- 주인공 레퍼런스 6장(용사 · 바드 · 점성술사 · 궁수 · 마법사 · 어쌔신)은 채팅으로만 받아서 **디스크에 없다.**
  `art/refs/heroes/` 가 비어 있으니, 다시 손볼 일이 있으면 그 폴더에 넣어 달라고 할 것
- 광장 동상은 아직 점선 실루엣

### 남은 것

| 화면 | 지금 | 할 일 |
|---|---|---|
| 대문 + 성문 기사 6명 | 코드로 그린 옛 그림 (`GateScene.tsx` · `lib/gateKnights.ts`) | 광장과 같은 방식으로 다시. 기사 레퍼런스 6장 필요 (`art/refs/gate-knights/`) |
| 모닥불 · 천막 (게시판 · 캘린더 배경) | 옛 그림 (`CampfireScene.tsx` · `TentScene.tsx`) | 같은 방식으로 다시 |
| 미니게임 (달려라 · 뛰어라 우왕이) | 16x22 격자 스프라이트 | 캐릭터 · 장애물 · 배경. **판정 박스는 그대로 둘 것** |
| 다른 곳의 주인공 그림 | `components/Sprite.tsx` (16x22) — 달려라 우왕이 캐릭터 선택 · 리더보드 아이콘 | 필요하면 `HeroSprite` 로 교체 |
| 광장 동상 | 분수 받침대 위 점선 실루엣 | 동상 디자인이 나오면 `PlazaScene.tsx` 의 `overlays.fountain` 교체 |

- 레퍼런스 넣는 곳: `art/refs/` ([art/refs/README.md](art/refs/README.md)). **이 안의 이미지는 git 에 안 올라간다** — 노트북을 옮기면 직접 옮겨야 한다.
  지금 들어 있는 것: `mascots/` (우왕이 · 단체 사진), `scenes/` 7장, `npcs/` 8장
- codixel 스킬(`~/.claude/skills/codixel`)의 도구 `pixel.js` 는 `art/vendor/codixel/` 에 넣어 뒀다 (MIT). 스킬이 없어도 `npm run art` 는 돈다.

## 2. 작업 방식 — 사용자가 정해 둔 것

Claude 의 메모리는 PC 마다 따로라서 새 노트북에는 안 따라온다. 여기 적어 둔다.

- **아트 업그레이드 = 새 디자인.** "업그레이드해 달라"는 기존 구도에 덧칠하라는 뜻이 아니다. 구도 · 배치부터
  새로 짜고, 중간중간 승인받지 말고 한 번에 끝까지 만든다. 레퍼런스는 섞어서 새 그림을 만드는 재료다.
- **미리보기 스크린샷을 보여 줄 필요 없다.** 타입 검사 → 커밋 → 푸시하면 사용자가 Vercel 에서 직접 본다.
- 캐릭터 픽셀 크기는 64px 로 정했다 (128px 과 비교해 보고 결정).
- 보안: Supabase `service_role` 키는 `.env.script.local` 에만 (커밋 금지). `scripts/output/` (회원 초기 비밀번호)도 커밋 금지.
  `arcade_scores` · `jump_scores` 만 일부러 누구나 읽고 쓸 수 있게 열어 둔 테이블이고, 나머지는 회원 전용이다.

## 3. 새 노트북 준비

```bash
git clone https://github.com/DinDjarin247/GDevFC_Homepage.git
cd GDevFC_Homepage
npm install
```

git 에 없어서 **직접 옮겨야 하는 것**:

| 무엇 | 어디 | 없으면 |
|---|---|---|
| `.env.local` | 저장소 루트 | 로그인·게시판·갤러리·리더보드가 안 됨 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `.env.script.local` | 저장소 루트 | 회원 계정 생성 스크립트만 안 됨. **service_role 키 — 절대 커밋·공유 금지** |
| 레퍼런스 이미지 | `art/refs/` | 새 화면의 아트 작업을 시작할 수 없음 (광장을 다시 굽는 데는 필요 없다) |

codixel 스킬 설치 (Claude Code 를 다시 켜면 로드됨):

```bash
git clone https://github.com/mankidev/codixel ~/.claude/skills/codixel
```

실행: `npm run dev` → http://localhost:3000 · 그림 다시 굽기: `npm run art`

## 4. 밟았던 함정 — 다시 밟지 말 것

| 함정 | 내용 |
|---|---|
| 이 PC 의 로컬 서버 · 빌드 | 저장소가 OneDrive 폴더 아래 있는 지금 PC 에서는 `npm run dev` 가 "Starting..." 에서 멈추고 `next build` 도 9분 넘게 출력 없이 끝나지 않는다. 확인은 `npx tsc --noEmit` → 푸시 → 배포 사이트로 한다. 캔버스 코드만 따로 보고 싶으면 `PlazaScene.tsx` 를 `typescript` 로 변환해 `python -m http.server` 로 띄운 정적 페이지에서 돌릴 수 있다 |
| 게임 빌드 주소 | `data/weekly-gg.json` 의 `src` 는 **폴더 주소**(`/wgg-builds/<id>/`)로. Vercel 은 `…/index.html` 을 404 로 돌린다. 반대로 `next dev` 는 폴더 주소를 못 열어서 `GamePlayer` 가 개발 서버에서만 `index.html` 을 붙인다 |
| 빌드 폴더 위치 | 빌드는 `public/wgg-builds/` 에. `public/weekly-gg/<id>/` 에 두면 페이지와 같은 파일로 export 돼 서로 덮어쓴다 (개발 서버에선 안 보임) |
| 배포 확인 | **푸시 후 반드시 배포 사이트에서 직접 확인.** 개발 서버에서 되는 것과 Vercel 에서 되는 것이 다르다. curl 은 Vercel 봇 차단(403)에 막히므로 브라우저로 본다 |
| `npm run build` | 개발 서버가 켜진 채로 돌리면 `.next` 가 꼬여 흰 화면. 개발 서버를 끄고 → 빌드 → 다시 켠다 |
| Unity WebGL | 압축 끈(Compression: Disabled) 빌드를 쓴다. GitHub "Download ZIP" 은 Git LFS 파일이 빈 껍데기라 빌드에 못 쓴다 — LFS 포함해 클론할 것. 다른 사본의 `Library` 캐시를 옮겨 쓰면 스크립트가 전부 missing 이 된다 |
| 파일 크기 | GitHub 는 파일 하나 100MB 까지. 50MB 넘으면 경고. 큰 빌드는 GitHub Releases 로 |
| 아트 스크립트 | `P.Buf.rect` 는 `(x0, y0, x1, y1, 색)` 이고 색은 항상 불투명하다 (지우려면 `put(i, 0)`). `P.sheet` 의 `scale` 은 정수만 |

## 5. 최근에 끝난 것 (참고)

- **광장** 전면 교체 (위 1번). 주간줴줴 입구는 분수 옆 소파에서 게임기 하는 우왕이
- **달려라 우왕이 V2**: 슬라이드 직후 점프가 무시되던 문제 수정 (`lib/run/world.ts` 의 `slideLock` —
  슬라이드 키를 누른 채 뛰면 빠른 낙하가 점프를 바로 지워 버렸다)
- **주간줴줴** (`/weekly-gg`): 동아리 게임 게시판. 계정 없이 플레이. 게임 10편 —
  웹 플레이 5 (고려골렘술사 · 지하실 · Silent Line · 에어밴드 · castee), PC 다운로드 3 (새벽의 타자기 · LOCK-JAW · Meejung), 자체 미니게임 2 (달려라 · 뛰어라 우왕이)
- **게임 제출** (`/weekly-gg/submit`): 드라이브 링크를 Formspree 로 보냄. 메일 제목 `[주간줴줴 게임 제출] …`
- 게임 추가 방법은 [README.md](README.md) 의 "주간줴줴" 절

## 6. 사용자가 정하거나 해 줘야 하는 것

- **Supabase SQL 실행 여부 확인**: `supabase/migrations/0005_jump_scores.sql` (뛰어라 우왕이 랭킹),
  `0006_arcade_scores_character.sql` (리더보드의 캐릭터 아이콘). 실행했다는 확인을 받지 못했다
- 이미 합쳐진 `origin/jspark` 브랜치를 지울지
- `/events` 주소를 `/calendar` 로 바꿀지
- 성문 기사 레퍼런스 6장을 `art/refs/gate-knights/` 에 다시 넣어 주기 (대문 작업의 선행 조건)

## 7. 남아 있는 자잘한 것

- `public/wgg-builds/downloads/` 의 zip 3개(약 150MB)가 저장소에 직접 들어 있다. 빌드가 더 쌓이면 Releases 로 옮기는 게 좋다
- castee 설명은 빌드 안 문구로 쓴 것 — 제작자(이현승) 확인 필요. 숫자 키패드가 없는 노트북에선 플레이가 안 될 수 있다
- Meejung 은 Windows 빌드만 올렸다 (macOS · 소스 제외)
- 이전 PC 의 `C:\wgg-build` (Unity 빌드 임시 폴더, 수 GB) 는 지워도 된다
- 앱화(PWA)는 검토만 했다: 아이콘 · manifest · 서비스워커가 없고, 폰트가 외부 CDN 이라 self-host 필요

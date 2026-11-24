# 인수인계 — 2026-11-24

다른 노트북에서 이어서 작업하기 위한 메모. 새 Claude Code 세션을 열면 **이 파일을 먼저 읽으라고** 하면 된다.

- 사이트: https://g-dev-fc-homepage.vercel.app
- 저장소: `DinDjarin247/GDevFC_Homepage`, 브랜치 `main` (푸시하면 Vercel 이 자동 배포)
- 마지막 커밋 기준으로 배포 사이트는 전부 정상 동작 확인됨

## 1. 픽셀 아트 대공사 — 광장은 끝, 나머지가 남았다

### 끝난 것: 광장(`/select`) 전면 교체 (2026-11-24)

구도부터 새로 짰다 — **언덕 도시의 계단 광장**. 앞은 분수가 있는 아래 광장, 가운데 큰 계단 위에
시계탑 문루가 선 윗마당, 그 뒤로 윗마을 · 절벽 위의 성 · 돌다리 · 폭포 · 하늘의 용.
배경 · 소품 · 마을 사람 16종 · 주인공 7명 · 시간대 6종을 한 번에 바꿨다.

- 만드는 곳: `art/plaza/*.js` (Node 스크립트), 굽기: `npm run art` → `public/art/plaza/*.png` + `lib/plazaArt.ts`
- 화면: `components/PlazaScene.tsx` (조각을 겹치고 움직이는 것만 그린다), `components/HeroSprite.tsx`
- 자리 옮기기: `art/plaza/placement.js` 만 고치고 다시 굽는다
- 자세한 표는 [README.md](README.md) 의 "SELECT MODE — 계단 광장"

방식 (다음 화면에도 그대로 쓴다):

- 색을 바로 찍지 않고 **재질 번호 + 밝기**로 그린 뒤, 재질마다 준비한 색 단계(어두울수록 푸르게, 밝을수록
  누렇게)에서 색을 고른다 (`art/plaza/kit.js` 의 `Mat`). 그늘이 탁해지지 않는다.
- 그림은 전부 한낮 기준. 시간대는 굽는 단계에서 색을 바꾸고(`grade.js`), 등불 주변만 따뜻한 원래 색으로 되돌린다.
- 사람은 부위별로 다시 그린다 (`npcs.js` 의 `figure`). 걷기 4 + 말하기 2 프레임, 거리별 3가지 크기를
  줄이지 않고 각각 그린다. 주인공도 같은 생성기에 옷 · 소지품만 덧붙였다 (`heroes.js`).
- 주인공 레퍼런스는 옷 · 색 · 자세만 따랐다 (그림을 그대로 변환하지 않았다 — 저작권 걱정이 없다).
  우왕이만 학교 캐릭터 그림을 픽셀로 옮긴 것이다 (`art/refs-pixel/woowang-64.png`).

### 남은 것

| 화면 | 지금 | 할 일 |
|---|---|---|
| 대문 + 성문 기사 6명 | 코드로 그린 옛 그림 (`GateScene.tsx` · `lib/gateKnights.ts`) | 광장과 같은 방식으로 다시. 기사 레퍼런스 6장 필요 (`art/refs/gate-knights/`) |
| 모닥불 · 천막 (게시판 · 캘린더 배경) | 옛 그림 (`CampfireScene.tsx` · `TentScene.tsx`) | 같은 방식으로 다시 |
| 미니게임 (달려라 · 뛰어라 우왕이) | 16x22 격자 스프라이트 | 캐릭터 · 장애물 · 배경. **판정 박스는 그대로 둘 것** |
| 다른 곳의 주인공 그림 | `components/Sprite.tsx` (16x22) — 달려라 우왕이 캐릭터 선택 · 리더보드 아이콘 | 필요하면 `HeroSprite` 로 교체 |
| 광장 동상 | 분수 받침대 위 점선 실루엣 | 동상 디자인이 나오면 `PlazaScene.tsx` 의 `overlays.fountain` 교체 |

- 레퍼런스 넣는 곳: `art/refs/` ([art/refs/README.md](art/refs/README.md)). **이 안의 이미지는 git 에 안 올라간다** — 노트북을 옮기면 직접 옮겨야 한다.
- codixel 스킬(`~/.claude/skills/codixel`)의 도구 `pixel.js` 는 `art/vendor/codixel/` 에 넣어 뒀다 (MIT). 스킬이 없어도 `npm run art` 는 돈다.

## 2. 새 노트북 준비

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
| 레퍼런스 이미지 | `art/refs/` | 아트 작업을 시작할 수 없음 |

codixel 스킬 설치 (Claude Code 를 다시 켜면 로드됨):

```bash
git clone https://github.com/mankidev/codixel ~/.claude/skills/codixel
```

실행: `npm run dev` → http://localhost:3000

## 3. 최근에 끝난 것 (참고)

- **주간줴줴** (`/weekly-gg`): 동아리 게임 게시판. 계정 없이 플레이. 게임 10편 —
  웹 플레이 5 (고려골렘술사 · 지하실 · Silent Line · 에어밴드 · castee), PC 다운로드 3 (새벽의 타자기 · LOCK-JAW · Meejung), 자체 미니게임 2 (달려라 · 뛰어라 우왕이)
- **게임 제출** (`/weekly-gg/submit`): 드라이브 링크를 Formspree 로 보냄. 메일 제목 `[주간줴줴 게임 제출] …`
- **광장**: 전면 교체 (위 1번). 주간줴줴 입구는 분수 옆 소파에서 게임기 하는 우왕이
- 게임 추가 방법은 [README.md](README.md) 의 "주간줴줴" 절

## 4. 밟았던 함정 — 다시 밟지 말 것

| 함정 | 내용 |
|---|---|
| 게임 빌드 주소 | `data/weekly-gg.json` 의 `src` 는 **폴더 주소**(`/wgg-builds/<id>/`)로. Vercel 은 `…/index.html` 을 404 로 돌린다. 반대로 `next dev` 는 폴더 주소를 못 열어서 `GamePlayer` 가 개발 서버에서만 `index.html` 을 붙인다 |
| 빌드 폴더 위치 | 빌드는 `public/wgg-builds/` 에. `public/weekly-gg/<id>/` 에 두면 페이지와 같은 파일로 export 돼 서로 덮어쓴다 (개발 서버에선 안 보임) |
| 배포 확인 | **푸시 후 반드시 배포 사이트에서 직접 확인.** 개발 서버에서 되는 것과 Vercel 에서 되는 것이 다르다. curl 은 Vercel 봇 차단(403)에 막히므로 브라우저로 본다 |
| `npm run build` | 개발 서버가 켜진 채로 돌리면 `.next` 가 꼬여 흰 화면. 개발 서버를 끄고 → 빌드 → 다시 켠다 |
| Unity WebGL | 압축 끈(Compression: Disabled) 빌드를 쓴다. GitHub "Download ZIP" 은 Git LFS 파일이 빈 껍데기라 빌드에 못 쓴다 — LFS 포함해 클론할 것. 다른 사본의 `Library` 캐시를 옮겨 쓰면 스크립트가 전부 missing 이 된다 |
| 파일 크기 | GitHub 는 파일 하나 100MB 까지. 50MB 넘으면 경고. 큰 빌드는 GitHub Releases 로 |

## 5. 남아 있는 자잘한 것

- `public/wgg-builds/downloads/` 의 zip 3개(약 150MB)가 저장소에 직접 들어 있다. 빌드가 더 쌓이면 Releases 로 옮기는 게 좋다
- castee 설명은 빌드 안 문구로 쓴 것 — 제작자(이현승) 확인 필요. 숫자 키패드가 없는 노트북에선 플레이가 안 될 수 있다
- Meejung 은 Windows 빌드만 올렸다 (macOS · 소스 제외)
- 이전 PC 의 `C:\wgg-build` (Unity 빌드 임시 폴더, 수 GB) 는 지워도 된다
- 앱화(PWA)는 검토만 했다: 아이콘 · manifest · 서비스워커가 없고, 폰트가 외부 CDN 이라 self-host 필요

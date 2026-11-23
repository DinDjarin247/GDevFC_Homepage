# 인수인계 — 2026-11-24

다른 노트북에서 이어서 작업하기 위한 메모. 새 Claude Code 세션을 열면 **이 파일을 먼저 읽으라고** 하면 된다.

- 사이트: https://g-dev-fc-homepage.vercel.app
- 저장소: `DinDjarin247/GDevFC_Homepage`, 브랜치 `main` (푸시하면 Vercel 이 자동 배포)
- 마지막 커밋 기준으로 배포 사이트는 전부 정상 동작 확인됨

## 1. 다음에 할 일 — 픽셀 아트 대공사

홈페이지의 모든 픽셀 아트를 [codixel](https://github.com/mankidev/codixel) 로 고급화한다. **아직 시작하지 않았다.** 계획과 준비물만 끝난 상태.

### 지금 막힌 곳: 레퍼런스 이미지가 없다

codixel 은 "코드로 그리지 말고 참고 이미지를 픽셀로 바꿔라"는 스킬이다. 캐릭터는 레퍼런스가 있어야 품질이 나온다.

- 넣을 곳: `art/refs/` (폴더는 만들어 둠, 목록은 [art/refs/README.md](art/refs/README.md))
- **`art/refs/` 안의 이미지는 git 에 안 올라간다** (`.gitignore`). 공개 저장소라 남의 그림을 올리면 안 되기 때문. → **노트북을 옮기면 이미지도 직접 옮겨야 한다.**
- 필수 17장: 충북대 마스코트 6 · 광장 주인공 6 · 성문 기사 6 (기사 6장은 전에 채팅으로 준 일러스트 — 원본이 임시 폴더에서 지워져 다시 필요)
- 시작에 필요한 건 **`art/refs/mascots/woowang` 1장**뿐

### 진행 순서

| 단계 | 내용 | 끝났다는 기준 |
|---|---|---|
| **0. 기준 정하기** | 파이프라인 구축 + 광장의 선술집 1채와 우왕이 1명만 새 방식으로 | "이 퀄리티로 가자" 승인 |
| 1. 주인공 | 광장 캐릭터 7명 + idle 프레임 | 기존과 나란히 비교 |
| 2. 광장 배경 | 건물·나무·바닥·소품, 시간대 6종 | 시간대별 스크린샷 |
| 3. 대문 + 성문 기사 6명 | 성벽·성문·횃불 | 조합 표본 확인 |
| 4. NPC 6종 | 걸음 4프레임 이상 | 프레임 시트 |
| 5. 모닥불·천막 | 게시판·캘린더 배경 | 페이지별 스크린샷 |
| 6. 미니게임 | 마스코트 동작, 장애물, 배경 | 플레이 가능 + 판정 박스 불변 |

**0단계 승인 전에는 다른 단계를 건드리지 않는다.** 방향이 틀리면 뒤를 전부 다시 해야 한다.

### 방식

- 지금: 아트가 전부 코드다 (문자 그리드 스프라이트 + 캔버스에 사각형 직접 그리기). 이미지 파일 0개.
- 바꿀 방식: Node 스크립트로 PNG 시트를 구워 `public/art/` 에 두고 `drawImage` 로 찍는다.
  - `art/` 에 원본 스크립트, `npm run art` 로 생성 (스크립트는 아직 없음 — 0단계에서 만든다)
  - 배경은 층별 PNG + 움직이는 부분(불·연기·깃발)은 루프 시트
  - 캐릭터 크기: 주인공 16×22 → 48×64 안팎, NPC 14×20 → 32×44 안팎
  - 시간대 조명(`PHASE_LABEL`)과 클릭 영역(`lib/plazaLayout.ts`)은 그대로 유지
- codixel 규칙: 단계마다 PNG 미리보기를 보여주고 승인받은 뒤 다음으로. 게임용 파일은 승인 후에 만든다.

### 아직 정하지 않은 것

1. **그림체 방향** — "사실적", "SNES RPG풍" 등 한마디
2. **저작권** — 성문 기사 일러스트는 베르세르크·페이트·원신 등 남의 작품. 이미지를 직접 변환하면 원작에 가까워진다. 포즈·색만 참고할지 그대로 변환할지
3. **광장 주인공 6명의 레퍼런스를 누가 고를지** — 직접 고르거나, Claude 가 후보를 찾아 보여주고 고르거나

### 현재 아트가 있는 파일

| 묶음 | 파일 |
|---|---|
| 주인공 스프라이트 25종 (16×22) | `components/Sprite.tsx` |
| 성문 기사 6명 (28×48) | `lib/gateKnights.ts` |
| 광장 NPC 6종 (14×20) | `lib/npcSprites.ts` |
| 광장 배경 | `components/PlazaScene.tsx` |
| 대문 · 모닥불 · 천막 배경 | `components/GateScene.tsx` · `CampfireScene.tsx` · `TentScene.tsx` |
| 달려라 우왕이 | `lib/run/art.ts` · `background.ts` · `characters.ts` |
| 뛰어라 우왕이 | `lib/jump/background.ts` · `world.ts` |

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
- **광장**: 미니게임 캐릭터 둘을 빼고, 그 자리에 소파에서 게임기 하는 우왕이 (주간줴줴 입구)
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

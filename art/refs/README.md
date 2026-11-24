# 아트 레퍼런스 넣는 곳

픽셀 아트 대공사(codixel)에 쓰는 참고 이미지 폴더. **이미지 파일은 git 에 올라가지 않는다**
(`.gitignore`) — 남의 그림이 섞여 있을 수 있어서, 공개 저장소에는 이 안내문만 남긴다.

## 지금 상태 (2026-11-24)

- 우왕이: 받음 (`mascots/woowang`), 64px 픽셀로 확정 → `art/refs-pixel/woowang-64.png`
- 광장 배경 · 마을 사람: `scenes/` · `npcs/` 의 그림을 참고해 완성. 더 필요 없다
- 광장 주인공 6명: 완성. 다만 레퍼런스는 채팅으로만 받아 `heroes/` 가 비어 있다 — 다시 손볼 때만 넣으면 된다
- **아직 필요한 것: `gate-knights/` 6장** (대문 작업), 나머지 마스코트 5종 (달려라 우왕이 캐릭터)

아래 표는 처음 요청할 때 쓴 목록이다.

## 이미지 조건

- 전신이 다 나온 것 (머리끝~발끝이 잘리지 않게)
- 정면 또는 살짝 옆(3/4) 각도, 서 있는 자세
- 배경이 단색이거나 투명하면 가장 좋다
- 긴 변 512px 이상, PNG · JPG · WebP
- 파일 이름은 아래 표대로 (확장자는 아무거나)

## 필요한 이미지

### 0단계 — 이것부터 (1장)

| 파일 | 무엇 |
|---|---|
| `mascots/woowang` | 우왕이 (충북대 마스코트) 전신 |

### mascots/ — 충북대 마스코트 (달려라 우왕이 캐릭터 선택)

| 파일 | 무엇 |
|---|---|
| `mascots/woowang` | 우왕이 |
| `mascots/neuru` | 느루 |
| `mascots/tana` | 타나 |
| `mascots/jwawang` | 좌왕이 |
| `mascots/steady` | 스테디 |
| `mascots/eunsong` | 은송이 |

### heroes/ — 광장의 주인공 6명

| 파일 | 무엇 | 지금 모습 |
|---|---|---|
| `heroes/knight` | 기사 (소개) | 금발, 은빛 갑옷, 파란 천, 방패 |
| `heroes/mage` | 마법사 (쇼케이스) | 보라 고깔모자와 로브, 지팡이 |
| `heroes/archer` | 엘프 궁수 (지원하기) | 플래티넘 금발, 민트 망토, 활 |
| `heroes/rogue` | 도적 (게시판) | 어두운 후드와 망토, 단검 |
| `heroes/bard` | 바드 (갤러리) | 챙 넓은 보라 모자, 류트 |
| `heroes/astrologer` | 점성술사 (캘린더) | 별무늬 인디고 로브, 수정구슬 |

### gate-knights/ — 대문을 지키는 기사 6명

전에 주신 일러스트 6장을 다시 넣어 주세요 (임시 폴더에 있던 원본은 지워졌습니다).

| 파일 | 무엇 |
|---|---|
| `gate-knights/crimson` | 붉은 깃 — 붉은 깃 투구, 흰 털 망토, 등불 |
| `gate-knights/hawk` | 은빛 매 — 은백색 갑옷, 금빛 날개 투구, 푸른 망토 |
| `gate-knights/blackswordsman` | 검은 검사 — 검은 망토, 대검 |
| `gate-knights/bluesaber` | 푸른 검성 — 금발, 은빛 흉갑, 푸른 드레스 |
| `gate-knights/whitewind` | 하얀 바람 — 금발 묶음머리, 흰 옷, 푸른 반망토 |
| `gate-knights/brasshelm` | 황금 투구 — 놋쇠 투구의 붉은 깃, 체크무늬 어깨 |

### npcs/ — 광장 행인 6종 (선택)

작게(30px 안팎) 나오므로 없으면 코드로 그립니다. 원하는 모습이 있을 때만.

`npcs/commoner` · `npcs/knight` · `npcs/mercenary` · `npcs/orc` · `npcs/elf` · `npcs/dwarf`

### scenes/ — 배경 분위기 (선택)

배경은 코드로 그리므로 필수는 아닙니다. "이런 느낌"을 보여줄 그림이 있을 때만.

`scenes/plaza` (마을 광장) · `scenes/gate` (성문) · `scenes/campfire` (모닥불) · `scenes/tent` (점성술 천막)

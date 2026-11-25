// 이 파일은 art/plaza/build.js 가 만든다 (npm run art). 손으로 고치지 말 것.
// 광장 그림 시트의 좌표와, 소품 · 마을 사람 · 주인공의 자리.

export const PLAZA_ART = {
 "w": 960,
 "h": 540,
 "backH": 324,
 "frontY": 266,
 "skyH": 312,
 "sheet": [
  1024,
  732
 ],
 "layerY": 318,
 "sprites": {
  "treeL_0": [
   0,
   0,
   240,
   250,
   96,
   244
  ],
  "treeL_1": [
   241,
   0,
   240,
   250,
   96,
   244
  ],
  "treeL_2": [
   482,
   0,
   240,
   250,
   96,
   244
  ],
  "treeR_0": [
   723,
   0,
   220,
   230,
   130,
   224
  ],
  "treeR_1": [
   0,
   251,
   220,
   230,
   130,
   224
  ],
  "treeR_2": [
   221,
   251,
   220,
   230,
   130,
   224
  ],
  "tent": [
   442,
   251,
   150,
   150,
   75,
   146
  ],
  "fountain_0": [
   593,
   251,
   168,
   132,
   84,
   123
  ],
  "fountain_1": [
   762,
   251,
   168,
   132,
   84,
   123
  ],
  "fountain_2": [
   0,
   482,
   168,
   132,
   84,
   123
  ],
  "fountain_3": [
   169,
   482,
   168,
   132,
   84,
   123
  ],
  "fall_0": [
   338,
   482,
   9,
   124,
   0,
   0
  ],
  "fall_1": [
   348,
   482,
   9,
   124,
   0,
   0
  ],
  "fall_2": [
   358,
   482,
   9,
   124,
   0,
   0
  ],
  "fall_3": [
   368,
   482,
   9,
   124,
   0,
   0
  ],
  "signpost": [
   378,
   482,
   84,
   120,
   40,
   116
  ],
  "lamp": [
   463,
   482,
   34,
   96,
   17,
   92
  ],
  "stallBread": [
   498,
   482,
   108,
   96,
   54,
   92
  ],
  "stallFruit": [
   607,
   482,
   116,
   96,
   58,
   92
  ],
  "stallScroll": [
   724,
   482,
   120,
   96,
   60,
   92
  ],
  "target": [
   845,
   482,
   84,
   84,
   40,
   80
  ],
  "tv": [
   930,
   482,
   64,
   76,
   32,
   72
  ],
  "cart": [
   0,
   615,
   112,
   72,
   50,
   68
  ],
  "clutter0": [
   113,
   615,
   90,
   60,
   45,
   56
  ],
  "clutter1": [
   204,
   615,
   90,
   60,
   45,
   56
  ],
  "clutter2": [
   295,
   615,
   90,
   60,
   45,
   56
  ],
  "sofa": [
   386,
   615,
   100,
   60,
   50,
   56
  ],
  "bench": [
   487,
   615,
   112,
   50,
   56,
   46
  ],
  "brazier": [
   600,
   615,
   34,
   50,
   17,
   46
  ],
  "flame_0": [
   635,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_1": [
   666,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_2": [
   697,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_3": [
   728,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_4": [
   759,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_5": [
   790,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_6": [
   821,
   615,
   30,
   46,
   15,
   42
  ],
  "flame_7": [
   852,
   615,
   30,
   46,
   15,
   42
  ],
  "dragon_0": [
   883,
   615,
   64,
   44,
   32,
   22
  ],
  "dragon_1": [
   948,
   615,
   64,
   44,
   32,
   22
  ],
  "dragon_2": [
   0,
   688,
   64,
   44,
   32,
   22
  ],
  "dragon_3": [
   65,
   688,
   64,
   44,
   32,
   22
  ],
  "dragon_4": [
   130,
   688,
   64,
   44,
   32,
   22
  ],
  "dragon_5": [
   195,
   688,
   64,
   44,
   32,
   22
  ],
  "puff_2": [
   260,
   688,
   14,
   14,
   7,
   7
  ],
  "console": [
   275,
   688,
   26,
   12,
   12,
   10
  ],
  "flag_0": [
   302,
   688,
   18,
   12,
   0,
   2
  ],
  "flag_1": [
   321,
   688,
   18,
   12,
   0,
   2
  ],
  "flag_2": [
   340,
   688,
   18,
   12,
   0,
   2
  ],
  "flag_3": [
   359,
   688,
   18,
   12,
   0,
   2
  ],
  "puff_1": [
   378,
   688,
   12,
   12,
   6,
   6
  ],
  "puff_0": [
   391,
   688,
   9,
   9,
   5,
   5
  ]
 },
 "props": [
  {
   "id": "treeL",
   "sprite": "treeL",
   "x": 30,
   "y": 488,
   "frames": 3,
   "fps": 2.2
  },
  {
   "id": "treeR",
   "sprite": "treeR",
   "x": 936,
   "y": 462,
   "frames": 3,
   "fps": 1.9
  },
  {
   "id": "tent",
   "sprite": "tent",
   "x": 150,
   "y": 448,
   "shadow": [
    64,
    10
   ]
  },
  {
   "id": "stallA",
   "sprite": "stallFruit",
   "x": 300,
   "y": 432,
   "shadow": [
    54,
    7
   ]
  },
  {
   "id": "stallB",
   "sprite": "stallBread",
   "x": 676,
   "y": 432,
   "shadow": [
    50,
    7
   ]
  },
  {
   "id": "target",
   "sprite": "target",
   "x": 896,
   "y": 440,
   "shadow": [
    40,
    7
   ]
  },
  {
   "id": "clutterA",
   "sprite": "clutter0",
   "x": 96,
   "y": 398,
   "shadow": [
    42,
    6
   ]
  },
  {
   "id": "clutterB",
   "sprite": "clutter2",
   "x": 838,
   "y": 400,
   "shadow": [
    42,
    6
   ]
  },
  {
   "id": "fountain",
   "sprite": "fountain",
   "x": 480,
   "y": 495,
   "frames": 4,
   "fps": 5
  },
  {
   "id": "tv",
   "sprite": "tv",
   "x": 200,
   "y": 488,
   "shadow": [
    26,
    5
   ]
  },
  {
   "id": "console",
   "sprite": "console",
   "x": 238,
   "y": 492
  },
  {
   "id": "sofa",
   "sprite": "sofa",
   "x": 288,
   "y": 486,
   "shadow": [
    48,
    7
   ]
  },
  {
   "id": "lampL",
   "sprite": "lamp",
   "x": 362,
   "y": 502,
   "shadow": [
    9,
    3
   ]
  },
  {
   "id": "lampR",
   "sprite": "lamp",
   "x": 600,
   "y": 502,
   "shadow": [
    9,
    3
   ]
  },
  {
   "id": "stallScroll",
   "sprite": "stallScroll",
   "x": 748,
   "y": 508,
   "shadow": [
    58,
    8
   ]
  },
  {
   "id": "brazier",
   "sprite": "brazier",
   "x": 84,
   "y": 520,
   "shadow": [
    14,
    4
   ]
  },
  {
   "id": "bench",
   "sprite": "bench",
   "x": 176,
   "y": 522,
   "shadow": [
    56,
    6
   ]
  },
  {
   "id": "cart",
   "sprite": "cart",
   "x": 880,
   "y": 520,
   "shadow": [
    54,
    7
   ]
  },
  {
   "id": "pumpkins",
   "sprite": "clutter1",
   "x": 44,
   "y": 548
  },
  {
   "id": "signpost",
   "sprite": "signpost",
   "x": 934,
   "y": 552
  }
 ],
 "npcs": [
  {
   "kind": "peasant",
   "mode": "walk",
   "zone": "terrace",
   "x": 80,
   "y": 312,
   "speed": 22
  },
  {
   "kind": "woman",
   "mode": "walk",
   "zone": "terrace",
   "x": 300,
   "y": 311,
   "speed": 18
  },
  {
   "kind": "monk",
   "mode": "walk",
   "zone": "terrace",
   "x": 650,
   "y": 312,
   "speed": 16
  },
  {
   "kind": "merchant",
   "mode": "walk",
   "zone": "terrace",
   "x": 820,
   "y": 312,
   "speed": 18
  },
  {
   "kind": "elf",
   "mode": "walk",
   "zone": "terrace",
   "x": 720,
   "y": 313,
   "speed": 24
  },
  {
   "kind": "maid",
   "mode": "post",
   "x": 182,
   "y": 311,
   "face": "E",
   "chat": 0.3
  },
  {
   "kind": "farmer",
   "mode": "post",
   "x": 198,
   "y": 311,
   "face": "W",
   "chat": 1.7
  },
  {
   "kind": "guard",
   "mode": "post",
   "x": 426,
   "y": 313,
   "face": "S"
  },
  {
   "kind": "guard",
   "mode": "post",
   "x": 534,
   "y": 313,
   "face": "S"
  },
  {
   "kind": "noble",
   "mode": "walk",
   "zone": "any",
   "x": 462,
   "y": 372,
   "speed": 15
  },
  {
   "kind": "elder",
   "mode": "walk",
   "zone": "any",
   "x": 500,
   "y": 314,
   "speed": 13
  },
  {
   "kind": "guard",
   "mode": "walk",
   "zone": "any",
   "x": 560,
   "y": 470,
   "speed": 19
  },
  {
   "kind": "woman",
   "mode": "post",
   "x": 300,
   "y": 420,
   "face": "S",
   "chat": 1.1
  },
  {
   "kind": "baker",
   "mode": "post",
   "x": 676,
   "y": 420,
   "face": "S",
   "chat": 2.6
  },
  {
   "kind": "mercenary",
   "mode": "post",
   "x": 222,
   "y": 410,
   "face": "E",
   "chat": 1.9
  },
  {
   "kind": "dwarf",
   "mode": "post",
   "x": 240,
   "y": 411,
   "face": "W",
   "chat": 0.5
  },
  {
   "kind": "orc",
   "mode": "post",
   "x": 604,
   "y": 446,
   "face": "E",
   "chat": 0.2
  },
  {
   "kind": "merchant",
   "mode": "post",
   "x": 623,
   "y": 447,
   "face": "W",
   "chat": 1.5
  },
  {
   "kind": "mercenary",
   "mode": "post",
   "x": 846,
   "y": 490,
   "face": "NW",
   "chat": 2.4
  },
  {
   "kind": "peasant",
   "mode": "post",
   "x": 268,
   "y": 516,
   "face": "N"
  },
  {
   "kind": "peasant",
   "mode": "walk",
   "zone": "court",
   "x": 560,
   "y": 398,
   "speed": 22
  },
  {
   "kind": "hooded",
   "mode": "walk",
   "zone": "court",
   "x": 60,
   "y": 410,
   "speed": 17
  },
  {
   "kind": "witch",
   "mode": "walk",
   "zone": "court",
   "x": 236,
   "y": 460,
   "speed": 15
  },
  {
   "kind": "maid",
   "mode": "walk",
   "zone": "court",
   "x": 720,
   "y": 456,
   "speed": 21
  },
  {
   "kind": "farmer",
   "mode": "walk",
   "zone": "court",
   "x": 380,
   "y": 452,
   "speed": 17
  },
  {
   "kind": "dwarf",
   "mode": "walk",
   "zone": "court",
   "x": 344,
   "y": 520,
   "speed": 16
  },
  {
   "kind": "elf",
   "mode": "walk",
   "zone": "court",
   "x": 584,
   "y": 478,
   "speed": 23
  },
  {
   "kind": "monk",
   "mode": "walk",
   "zone": "court",
   "x": 640,
   "y": 530,
   "speed": 14
  },
  {
   "kind": "orc",
   "mode": "walk",
   "zone": "court",
   "x": 900,
   "y": 490,
   "speed": 18
  }
 ],
 "pois": [
  {
   "x": 40,
   "y": 309,
   "zone": "terrace",
   "face": "SE"
  },
  {
   "x": 150,
   "y": 312,
   "zone": "terrace",
   "face": "S"
  },
  {
   "x": 250,
   "y": 315,
   "zone": "terrace",
   "face": "SE"
  },
  {
   "x": 350,
   "y": 309,
   "zone": "terrace",
   "face": "S"
  },
  {
   "x": 610,
   "y": 312,
   "zone": "terrace",
   "face": "SE"
  },
  {
   "x": 700,
   "y": 315,
   "zone": "terrace",
   "face": "S"
  },
  {
   "x": 800,
   "y": 309,
   "zone": "terrace",
   "face": "SE"
  },
  {
   "x": 900,
   "y": 312,
   "zone": "terrace",
   "face": "S"
  },
  {
   "x": 470,
   "y": 309,
   "zone": "terrace",
   "face": "N"
  },
  {
   "x": 300,
   "y": 446,
   "zone": "court",
   "face": "N",
   "tag": "stall"
  },
  {
   "x": 322,
   "y": 448,
   "zone": "court",
   "face": "N",
   "tag": "stall"
  },
  {
   "x": 676,
   "y": 446,
   "zone": "court",
   "face": "N",
   "tag": "stall"
  },
  {
   "x": 654,
   "y": 448,
   "zone": "court",
   "face": "N",
   "tag": "stall"
  },
  {
   "x": 386,
   "y": 462,
   "zone": "court",
   "face": "E",
   "tag": "fountain"
  },
  {
   "x": 574,
   "y": 462,
   "zone": "court",
   "face": "W",
   "tag": "fountain"
  },
  {
   "x": 480,
   "y": 420,
   "zone": "court",
   "face": "S",
   "tag": "fountain"
  },
  {
   "x": 440,
   "y": 496,
   "zone": "court",
   "face": "N",
   "tag": "fountain"
  },
  {
   "x": 236,
   "y": 518,
   "zone": "court",
   "face": "N",
   "tag": "tv"
  },
  {
   "x": 760,
   "y": 472,
   "zone": "court",
   "face": "E",
   "tag": "archery"
  },
  {
   "x": 880,
   "y": 474,
   "zone": "court",
   "face": "N",
   "tag": "archery"
  },
  {
   "x": 760,
   "y": 530,
   "zone": "court",
   "face": "N",
   "tag": "scrolls"
  },
  {
   "x": 182,
   "y": 466,
   "zone": "court",
   "face": "N",
   "tag": "tent"
  },
  {
   "x": 438,
   "y": 410,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 524,
   "y": 410,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 60,
   "y": 414,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 160,
   "y": 404,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 780,
   "y": 406,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 920,
   "y": 414,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 800,
   "y": 532,
   "zone": "court",
   "face": "N",
   "tag": "cart"
  },
  {
   "x": 586,
   "y": 528,
   "zone": "court",
   "face": "S"
  },
  {
   "x": 40,
   "y": 466,
   "zone": "court",
   "face": "E"
  },
  {
   "x": 73,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  },
  {
   "x": 168,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  },
  {
   "x": 329,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  },
  {
   "x": 697,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  },
  {
   "x": 740,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  },
  {
   "x": 852,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  },
  {
   "x": 934,
   "y": 304,
   "zone": "terrace",
   "face": "N",
   "tag": "door"
  }
 ],
 "nav": {
  "cell": 4,
  "cols": 240,
  "rows": 135,
  "bits": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P////////////////////////////////////8//P////+P+P////////v//9////////////////8//P/////f/f////////H//4////////////////8/AAAAAAAAAAAAAAAAAP////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP////8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP////8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP////8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP////8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P////8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4P////8HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8P////8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8P////8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8P////8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P////8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+P////8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P////8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P////8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v////9/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v////9/AAAAAAAAAAAAAAAA/v8BgP///////////////////////////wMA/v9//v8BgP////////+B////////A////////wMA/v9//v8BgP///x8AAACA////////Ax8AAMD//wMA/v9//v8BgP///x8AAACA////////Ax8AAMD//wMA/v9//v///////x8AAACA////////Ax8AAMD//wMA/v9//v//////PwIAAACA////////Ax8AAMD///////9//v8fAAAAwAcAAACA////////Ax8AAMD///////9//v8fAAAAwB8AAAD8/////////x8AAMD///////9//v8fAAAAwB8AAAD8/////////x8AAMD///////9//v8fAAAAwB8AAAD8/////////x8AAMD/////AIB//v8fAAAAwB8AAAD8/z8AAPz//x8AAMD//wAAAIB//v8fAAAAwB8AAAD8/wMAAMD//x8AAMD//wAAAIB//v8fAAAAwP//////fwAAAAD+////////BwAAAIB//v8fAAAAwP//////HwAAAAD4////////AwAAAIB//v8HAAAAwP//////DwAAAADwH+L/////BwAAAIB//v8DAAAAwP//////BwAAAADg/+f//////wAA/P9//v8H////////////BwAAAADg//////////////9//v//////////////AwAAAADA//////////////9w/v//////////////BwAAAADg/////////////39g/v//////////////BwAAAADg//////////////9w/v//////////////DwAAAADw//////////////9//v////8PAAAAAPj/HwAAAAD4//////////////9//v////8PAAAAAPj/fwAAAAD+//////////////9/fv////8PAAAAAPj//wMAAMD///////////////9/Dvj///8PAAAAAPj//z8AAPz///////////////9/Dvj///8PAAAAAPj////////////////////j//9/fv////8PAAAAAPj/////////////PwAAAP////9//v//////////////////////////PwAAAP////9//v/////////////xAwAAAADAD///PwAAAP////9//v//////////////AwAAAADA////PwAAAD8AAAB8/v//////////////AwAAAADA////PwAAAD8AAAB8/v///w8A4P/z////AwAAAADA////AwAAAD8AAAB8/v8D/w8A4P/z////AwAAAADA////Af///z8AAAB8/v8D/w8A4P//////////////////g////z8AAAB8/v///wEA4P///////////////////////z8AAAB8/v///4D///////////////////////////////9//v///8H///////////////////////////////9//v////////////////////////////////////9/"
 },
 "people": {
  "sheet": [
   1024,
   1777
  ],
  "rects": {
   "h_bard_se": [
    0,
    0,
    29,
    80,
    11,
    76
   ],
   "h_astrologer_s0": [
    30,
    0,
    37,
    79,
    22,
    74
   ],
   "h_astrologer_up": [
    68,
    0,
    29,
    79,
    16,
    74
   ],
   "h_astrologer_f0": [
    98,
    0,
    29,
    78,
    13,
    73
   ],
   "h_astrologer_f1": [
    128,
    0,
    29,
    78,
    13,
    73
   ],
   "h_astrologer_f2": [
    158,
    0,
    29,
    78,
    13,
    73
   ],
   "h_astrologer_g0": [
    188,
    0,
    32,
    78,
    17,
    74
   ],
   "h_astrologer_g1": [
    221,
    0,
    30,
    78,
    15,
    74
   ],
   "h_astrologer_r0": [
    252,
    0,
    29,
    78,
    13,
    73
   ],
   "h_bard_p2": [
    282,
    0,
    30,
    78,
    13,
    74
   ],
   "h_bard_e0": [
    313,
    0,
    27,
    77,
    13,
    74
   ],
   "h_bard_e4": [
    341,
    0,
    27,
    77,
    13,
    74
   ],
   "h_bard_e5": [
    369,
    0,
    27,
    77,
    13,
    74
   ],
   "h_bard_e6": [
    397,
    0,
    28,
    77,
    14,
    74
   ],
   "h_bard_e7": [
    426,
    0,
    28,
    77,
    14,
    74
   ],
   "h_bard_p0": [
    455,
    0,
    30,
    77,
    13,
    73
   ],
   "h_bard_p1": [
    486,
    0,
    30,
    77,
    13,
    73
   ],
   "h_bard_p3": [
    517,
    0,
    30,
    77,
    13,
    73
   ],
   "h_astrologer_r1": [
    548,
    0,
    29,
    76,
    13,
    71
   ],
   "h_bard_e1": [
    578,
    0,
    27,
    76,
    13,
    75
   ],
   "h_bard_e2": [
    606,
    0,
    28,
    76,
    14,
    75
   ],
   "h_bard_e3": [
    635,
    0,
    28,
    75,
    14,
    74
   ],
   "h_bard_sw": [
    664,
    0,
    31,
    74,
    14,
    70
   ],
   "h_mage_g0": [
    696,
    0,
    34,
    72,
    16,
    67
   ],
   "h_mage_g1": [
    731,
    0,
    34,
    72,
    16,
    67
   ],
   "h_mage_i0": [
    766,
    0,
    37,
    72,
    20,
    67
   ],
   "h_mage_reach": [
    804,
    0,
    41,
    72,
    20,
    67
   ],
   "h_mage_read": [
    846,
    0,
    37,
    72,
    20,
    67
   ],
   "h_mage_se": [
    884,
    0,
    36,
    72,
    19,
    67
   ],
   "h_mage_i1": [
    921,
    0,
    37,
    71,
    20,
    66
   ],
   "h_bard_w1": [
    959,
    0,
    27,
    70,
    14,
    67
   ],
   "h_bard_w2": [
    987,
    0,
    28,
    70,
    14,
    67
   ],
   "h_bard_w3": [
    0,
    81,
    28,
    70,
    14,
    67
   ],
   "h_bard_w4": [
    29,
    81,
    27,
    70,
    14,
    67
   ],
   "h_bard_w0": [
    57,
    81,
    27,
    69,
    14,
    66
   ],
   "h_bard_w6": [
    85,
    81,
    28,
    69,
    14,
    68
   ],
   "h_bard_w5": [
    114,
    81,
    27,
    68,
    14,
    67
   ],
   "h_bard_w7": [
    142,
    81,
    28,
    68,
    14,
    67
   ],
   "h_knight_warm0": [
    171,
    81,
    37,
    68,
    17,
    63
   ],
   "h_knight_g0": [
    209,
    81,
    31,
    67,
    17,
    63
   ],
   "h_knight_g1": [
    241,
    81,
    28,
    67,
    14,
    63
   ],
   "h_knight_i0": [
    270,
    81,
    31,
    67,
    18,
    63
   ],
   "h_knight_s0": [
    302,
    81,
    28,
    67,
    14,
    63
   ],
   "h_knight_sw": [
    331,
    81,
    31,
    67,
    13,
    63
   ],
   "h_knight_warm1": [
    363,
    81,
    37,
    67,
    17,
    62
   ],
   "h_knight_i1": [
    401,
    81,
    31,
    65,
    18,
    61
   ],
   "h_archer_draw1": [
    433,
    81,
    37,
    64,
    10,
    61
   ],
   "h_archer_draw2": [
    471,
    81,
    37,
    64,
    10,
    61
   ],
   "h_archer_follow": [
    509,
    81,
    30,
    64,
    10,
    61
   ],
   "h_archer_g0": [
    540,
    81,
    28,
    64,
    16,
    61
   ],
   "h_archer_g1": [
    569,
    81,
    25,
    64,
    13,
    61
   ],
   "h_archer_i0": [
    595,
    81,
    21,
    64,
    10,
    61
   ],
   "h_archer_lower": [
    617,
    81,
    24,
    64,
    10,
    61
   ],
   "h_archer_nock": [
    642,
    81,
    35,
    64,
    10,
    61
   ],
   "h_archer_reach": [
    678,
    81,
    21,
    64,
    10,
    61
   ],
   "h_archer_release": [
    700,
    81,
    30,
    64,
    10,
    61
   ],
   "h_archer_se": [
    731,
    81,
    21,
    64,
    10,
    61
   ],
   "h_archer_i1": [
    753,
    81,
    21,
    62,
    10,
    59
   ],
   "h_woowang_idle": [
    775,
    81,
    51,
    60,
    25,
    61
   ],
   "h_woowang_press": [
    827,
    81,
    51,
    60,
    25,
    61
   ],
   "guard_4_N_w0": [
    879,
    81,
    20,
    56,
    10,
    52
   ],
   "guard_4_N_w7": [
    900,
    81,
    19,
    55,
    9,
    52
   ],
   "guard_4_N_w4": [
    920,
    81,
    20,
    54,
    10,
    50
   ],
   "guard_4_N_i0": [
    941,
    81,
    20,
    53,
    10,
    51
   ],
   "guard_4_N_w1": [
    962,
    81,
    19,
    53,
    10,
    52
   ],
   "guard_4_N_w2": [
    982,
    81,
    19,
    53,
    10,
    51
   ],
   "guard_4_N_w3": [
    1002,
    81,
    19,
    53,
    10,
    50
   ],
   "guard_4_N_w6": [
    0,
    152,
    19,
    53,
    9,
    51
   ],
   "guard_4_NE_w0": [
    20,
    152,
    23,
    52,
    9,
    49
   ],
   "guard_4_NE_w7": [
    44,
    152,
    22,
    52,
    8,
    49
   ],
   "guard_4_N_i1": [
    67,
    152,
    20,
    52,
    10,
    50
   ],
   "guard_4_N_w5": [
    88,
    152,
    19,
    52,
    9,
    51
   ],
   "guard_4_NE_w1": [
    108,
    152,
    21,
    51,
    8,
    49
   ],
   "witch_4_E_w0": [
    130,
    152,
    24,
    51,
    13,
    47
   ],
   "witch_4_E_w2": [
    155,
    152,
    23,
    51,
    12,
    48
   ],
   "witch_4_E_w3": [
    179,
    152,
    24,
    51,
    13,
    47
   ],
   "witch_4_E_w4": [
    204,
    152,
    24,
    51,
    13,
    47
   ],
   "witch_4_E_w7": [
    229,
    152,
    24,
    51,
    13,
    47
   ],
   "witch_4_NE_w0": [
    254,
    152,
    24,
    51,
    11,
    47
   ],
   "witch_4_NE_w3": [
    279,
    152,
    23,
    51,
    11,
    47
   ],
   "witch_4_NE_w4": [
    303,
    152,
    23,
    51,
    11,
    47
   ],
   "witch_4_NE_w5": [
    327,
    152,
    23,
    51,
    11,
    47
   ],
   "witch_4_NE_w7": [
    351,
    152,
    24,
    51,
    11,
    47
   ],
   "witch_4_N_w0": [
    376,
    152,
    18,
    51,
    9,
    47
   ],
   "witch_4_N_w1": [
    395,
    152,
    19,
    51,
    10,
    47
   ],
   "witch_4_N_w3": [
    415,
    152,
    19,
    51,
    10,
    47
   ],
   "witch_4_N_w4": [
    435,
    152,
    18,
    51,
    9,
    47
   ],
   "witch_4_N_w5": [
    454,
    152,
    19,
    51,
    9,
    47
   ],
   "witch_4_N_w7": [
    474,
    152,
    19,
    51,
    9,
    47
   ],
   "witch_4_SE_i0": [
    494,
    152,
    20,
    51,
    10,
    48
   ],
   "witch_4_SE_w0": [
    515,
    152,
    22,
    51,
    11,
    47
   ],
   "witch_4_SE_w2": [
    538,
    152,
    22,
    51,
    11,
    48
   ],
   "witch_4_SE_w3": [
    561,
    152,
    22,
    51,
    11,
    47
   ],
   "witch_4_SE_w4": [
    584,
    152,
    23,
    51,
    11,
    47
   ],
   "witch_4_SE_w6": [
    608,
    152,
    21,
    51,
    11,
    48
   ],
   "witch_4_SE_w7": [
    630,
    152,
    21,
    51,
    11,
    47
   ],
   "witch_4_S_i0": [
    652,
    152,
    18,
    51,
    9,
    48
   ],
   "witch_4_S_w0": [
    671,
    152,
    18,
    51,
    9,
    47
   ],
   "witch_4_S_w1": [
    690,
    152,
    19,
    51,
    9,
    48
   ],
   "witch_4_S_w2": [
    710,
    152,
    19,
    51,
    9,
    48
   ],
   "witch_4_S_w3": [
    730,
    152,
    19,
    51,
    9,
    47
   ],
   "witch_4_S_w4": [
    750,
    152,
    18,
    51,
    9,
    47
   ],
   "witch_4_S_w5": [
    769,
    152,
    19,
    51,
    10,
    48
   ],
   "witch_4_S_w6": [
    789,
    152,
    19,
    51,
    10,
    48
   ],
   "witch_4_S_w7": [
    809,
    152,
    19,
    51,
    10,
    47
   ],
   "guard_4_NE_i0": [
    829,
    152,
    21,
    50,
    8,
    48
   ],
   "guard_4_NE_w2": [
    851,
    152,
    21,
    50,
    8,
    49
   ],
   "guard_4_NE_w3": [
    873,
    152,
    19,
    50,
    7,
    48
   ],
   "guard_4_NE_w5": [
    893,
    152,
    20,
    50,
    7,
    48
   ],
   "guard_4_NE_w6": [
    914,
    152,
    20,
    50,
    7,
    48
   ],
   "witch_4_E_w1": [
    935,
    152,
    24,
    50,
    13,
    47
   ],
   "witch_4_E_w5": [
    960,
    152,
    24,
    50,
    13,
    47
   ],
   "witch_4_E_w6": [
    985,
    152,
    24,
    50,
    13,
    47
   ],
   "witch_4_NE_w1": [
    0,
    206,
    24,
    50,
    11,
    47
   ],
   "witch_4_NE_w2": [
    25,
    206,
    23,
    50,
    11,
    47
   ],
   "witch_4_NE_w6": [
    49,
    206,
    24,
    50,
    11,
    47
   ],
   "witch_4_N_w2": [
    74,
    206,
    19,
    50,
    10,
    47
   ],
   "witch_4_N_w6": [
    94,
    206,
    19,
    50,
    9,
    47
   ],
   "witch_4_SE_i1": [
    114,
    206,
    20,
    50,
    10,
    47
   ],
   "witch_4_SE_w1": [
    135,
    206,
    22,
    50,
    11,
    47
   ],
   "witch_4_SE_w5": [
    158,
    206,
    22,
    50,
    11,
    47
   ],
   "witch_4_S_i1": [
    181,
    206,
    18,
    50,
    9,
    47
   ],
   "guard_3_N_w0": [
    200,
    206,
    18,
    49,
    9,
    46
   ],
   "guard_4_NE_i1": [
    219,
    206,
    21,
    49,
    8,
    47
   ],
   "guard_4_NE_w4": [
    241,
    206,
    19,
    49,
    7,
    47
   ],
   "witch_4_E_i0": [
    261,
    206,
    21,
    49,
    11,
    47
   ],
   "witch_4_NE_i0": [
    283,
    206,
    22,
    49,
    10,
    47
   ],
   "witch_4_N_i0": [
    306,
    206,
    18,
    49,
    9,
    47
   ],
   "guard_3_N_w3": [
    325,
    206,
    17,
    48,
    9,
    45
   ],
   "guard_3_N_w7": [
    343,
    206,
    17,
    48,
    8,
    45
   ],
   "guard_4_S_i0": [
    361,
    206,
    20,
    48,
    10,
    45
   ],
   "guard_4_S_w0": [
    382,
    206,
    20,
    48,
    10,
    44
   ],
   "guard_4_S_w2": [
    403,
    206,
    19,
    48,
    9,
    45
   ],
   "guard_4_S_w4": [
    423,
    206,
    20,
    48,
    10,
    44
   ],
   "guard_4_S_w5": [
    444,
    206,
    19,
    48,
    10,
    45
   ],
   "guard_4_S_w6": [
    464,
    206,
    19,
    48,
    10,
    45
   ],
   "witch_4_E_i1": [
    484,
    206,
    21,
    48,
    11,
    46
   ],
   "witch_4_NE_i1": [
    506,
    206,
    22,
    48,
    10,
    46
   ],
   "witch_4_N_i1": [
    529,
    206,
    18,
    48,
    9,
    46
   ],
   "guard_3_N_i0": [
    548,
    206,
    18,
    47,
    9,
    45
   ],
   "guard_3_N_w1": [
    567,
    206,
    17,
    47,
    9,
    46
   ],
   "guard_3_N_w2": [
    585,
    206,
    17,
    47,
    9,
    45
   ],
   "guard_3_N_w4": [
    603,
    206,
    18,
    47,
    9,
    44
   ],
   "guard_3_N_w6": [
    622,
    206,
    17,
    47,
    8,
    45
   ],
   "guard_4_E_i0": [
    640,
    206,
    18,
    47,
    8,
    45
   ],
   "guard_4_E_w0": [
    659,
    206,
    20,
    47,
    8,
    45
   ],
   "guard_4_E_w1": [
    680,
    206,
    19,
    47,
    7,
    46
   ],
   "guard_4_E_w2": [
    700,
    206,
    18,
    47,
    7,
    46
   ],
   "guard_4_E_w4": [
    719,
    206,
    19,
    47,
    8,
    45
   ],
   "guard_4_E_w5": [
    739,
    206,
    17,
    47,
    7,
    45
   ],
   "guard_4_E_w6": [
    757,
    206,
    18,
    47,
    7,
    45
   ],
   "guard_4_E_w7": [
    776,
    206,
    19,
    47,
    7,
    45
   ],
   "guard_4_SE_i0": [
    796,
    206,
    17,
    47,
    8,
    44
   ],
   "guard_4_SE_w4": [
    814,
    206,
    21,
    47,
    8,
    43
   ],
   "guard_4_SE_w5": [
    836,
    206,
    20,
    47,
    8,
    44
   ],
   "guard_4_SE_w6": [
    857,
    206,
    16,
    47,
    8,
    44
   ],
   "guard_4_S_i1": [
    874,
    206,
    20,
    47,
    10,
    44
   ],
   "guard_4_S_w1": [
    895,
    206,
    19,
    47,
    9,
    44
   ],
   "orc_4_NE_w0": [
    915,
    206,
    24,
    47,
    11,
    43
   ],
   "orc_4_N_w0": [
    940,
    206,
    23,
    47,
    11,
    43
   ],
   "orc_4_N_w3": [
    964,
    206,
    24,
    47,
    12,
    44
   ],
   "orc_4_N_w4": [
    989,
    206,
    23,
    47,
    11,
    43
   ],
   "orc_4_N_w7": [
    0,
    257,
    24,
    47,
    11,
    44
   ],
   "elder_4_N_w0": [
    25,
    257,
    18,
    46,
    9,
    42
   ],
   "elder_4_N_w1": [
    44,
    257,
    18,
    46,
    9,
    42
   ],
   "elder_4_N_w7": [
    63,
    257,
    19,
    46,
    9,
    42
   ],
   "farmer_4_SE_i0": [
    83,
    257,
    21,
    46,
    10,
    41
   ],
   "farmer_4_SE_w2": [
    105,
    257,
    21,
    46,
    9,
    41
   ],
   "farmer_4_S_i0": [
    127,
    257,
    22,
    46,
    11,
    41
   ],
   "guard_3_NE_w0": [
    150,
    257,
    20,
    46,
    8,
    43
   ],
   "guard_3_NE_w7": [
    171,
    257,
    19,
    46,
    7,
    43
   ],
   "guard_3_N_i1": [
    191,
    257,
    18,
    46,
    9,
    44
   ],
   "guard_3_N_w5": [
    210,
    257,
    17,
    46,
    8,
    45
   ],
   "guard_4_E_i1": [
    228,
    257,
    18,
    46,
    8,
    44
   ],
   "guard_4_E_w3": [
    247,
    257,
    17,
    46,
    7,
    45
   ],
   "guard_4_SE_i1": [
    265,
    257,
    17,
    46,
    8,
    43
   ],
   "guard_4_SE_w0": [
    283,
    257,
    15,
    46,
    7,
    43
   ],
   "guard_4_SE_w1": [
    299,
    257,
    15,
    46,
    7,
    44
   ],
   "guard_4_SE_w2": [
    315,
    257,
    16,
    46,
    7,
    44
   ],
   "guard_4_SE_w3": [
    332,
    257,
    19,
    46,
    7,
    44
   ],
   "guard_4_SE_w7": [
    352,
    257,
    16,
    46,
    7,
    44
   ],
   "guard_4_S_w3": [
    369,
    257,
    19,
    46,
    9,
    44
   ],
   "guard_4_S_w7": [
    389,
    257,
    19,
    46,
    10,
    44
   ],
   "h_rogue_i0": [
    409,
    257,
    27,
    46,
    9,
    41
   ],
   "h_rogue_lookL": [
    437,
    257,
    27,
    46,
    9,
    41
   ],
   "h_rogue_lookR": [
    465,
    257,
    27,
    46,
    9,
    41
   ],
   "h_rogue_t0": [
    493,
    257,
    27,
    46,
    9,
    41
   ],
   "h_rogue_t1": [
    521,
    257,
    27,
    46,
    9,
    41
   ],
   "h_rogue_t2": [
    549,
    257,
    27,
    46,
    9,
    41
   ],
   "h_rogue_t3": [
    577,
    257,
    27,
    46,
    9,
    41
   ],
   "hooded_4_N_w2": [
    605,
    257,
    18,
    46,
    9,
    42
   ],
   "hooded_4_N_w6": [
    624,
    257,
    18,
    46,
    9,
    42
   ],
   "noble_4_NE_w6": [
    643,
    257,
    18,
    46,
    9,
    41
   ],
   "noble_4_N_w1": [
    662,
    257,
    17,
    46,
    9,
    41
   ],
   "noble_4_N_w2": [
    680,
    257,
    18,
    46,
    9,
    41
   ],
   "noble_4_N_w3": [
    699,
    257,
    18,
    46,
    9,
    41
   ],
   "noble_4_N_w5": [
    718,
    257,
    17,
    46,
    8,
    41
   ],
   "noble_4_N_w6": [
    736,
    257,
    18,
    46,
    9,
    41
   ],
   "noble_4_N_w7": [
    755,
    257,
    18,
    46,
    9,
    41
   ],
   "orc_4_E_i0": [
    774,
    257,
    17,
    46,
    9,
    43
   ],
   "orc_4_E_w0": [
    792,
    257,
    18,
    46,
    8,
    43
   ],
   "orc_4_E_w4": [
    811,
    257,
    21,
    46,
    9,
    43
   ],
   "orc_4_E_w5": [
    833,
    257,
    20,
    46,
    9,
    43
   ],
   "orc_4_E_w6": [
    854,
    257,
    18,
    46,
    9,
    43
   ],
   "orc_4_E_w7": [
    873,
    257,
    19,
    46,
    9,
    43
   ],
   "orc_4_NE_i0": [
    893,
    257,
    21,
    46,
    9,
    43
   ],
   "orc_4_NE_w4": [
    915,
    257,
    20,
    46,
    8,
    43
   ],
   "orc_4_NE_w6": [
    936,
    257,
    21,
    46,
    8,
    43
   ],
   "orc_4_NE_w7": [
    958,
    257,
    23,
    46,
    10,
    43
   ],
   "orc_4_N_w1": [
    982,
    257,
    24,
    46,
    12,
    44
   ],
   "orc_4_N_w2": [
    0,
    305,
    24,
    46,
    12,
    44
   ],
   "orc_4_N_w5": [
    25,
    305,
    24,
    46,
    11,
    44
   ],
   "orc_4_N_w6": [
    50,
    305,
    24,
    46,
    11,
    44
   ],
   "orc_4_SE_i0": [
    75,
    305,
    23,
    46,
    12,
    43
   ],
   "orc_4_SE_w4": [
    99,
    305,
    27,
    46,
    12,
    42
   ],
   "orc_4_SE_w5": [
    127,
    305,
    26,
    46,
    12,
    42
   ],
   "orc_4_SE_w6": [
    154,
    305,
    21,
    46,
    11,
    43
   ],
   "orc_4_S_i0": [
    176,
    305,
    24,
    46,
    12,
    43
   ],
   "orc_4_S_w0": [
    201,
    305,
    23,
    46,
    12,
    42
   ],
   "orc_4_S_w1": [
    225,
    305,
    24,
    46,
    12,
    42
   ],
   "orc_4_S_w4": [
    250,
    305,
    23,
    46,
    12,
    42
   ],
   "orc_4_S_w5": [
    274,
    305,
    24,
    46,
    13,
    42
   ],
   "witch_3_SE_w4": [
    299,
    305,
    21,
    46,
    10,
    42
   ],
   "witch_3_S_w0": [
    321,
    305,
    16,
    46,
    8,
    42
   ],
   "witch_3_S_w4": [
    338,
    305,
    16,
    46,
    8,
    42
   ],
   "elder_4_NE_w2": [
    355,
    305,
    24,
    45,
    11,
    41
   ],
   "elder_4_N_w2": [
    380,
    305,
    18,
    45,
    9,
    41
   ],
   "elder_4_N_w3": [
    399,
    305,
    19,
    45,
    10,
    41
   ],
   "elder_4_N_w5": [
    419,
    305,
    17,
    45,
    8,
    41
   ],
   "elder_4_N_w6": [
    437,
    305,
    18,
    45,
    9,
    41
   ],
   "farmer_4_E_i0": [
    456,
    305,
    22,
    45,
    10,
    41
   ],
   "farmer_4_E_w0": [
    479,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w1": [
    501,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w2": [
    523,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w3": [
    545,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w4": [
    567,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w5": [
    589,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w6": [
    611,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_E_w7": [
    633,
    305,
    21,
    45,
    9,
    41
   ],
   "farmer_4_N_w0": [
    655,
    305,
    22,
    45,
    11,
    41
   ],
   "farmer_4_N_w4": [
    678,
    305,
    22,
    45,
    11,
    41
   ],
   "farmer_4_SE_i1": [
    701,
    305,
    21,
    45,
    10,
    40
   ],
   "farmer_4_SE_w0": [
    723,
    305,
    22,
    45,
    10,
    40
   ],
   "farmer_4_SE_w1": [
    746,
    305,
    21,
    45,
    9,
    40
   ],
   "farmer_4_SE_w3": [
    768,
    305,
    21,
    45,
    9,
    40
   ],
   "farmer_4_SE_w4": [
    790,
    305,
    23,
    45,
    10,
    40
   ],
   "farmer_4_SE_w5": [
    814,
    305,
    22,
    45,
    10,
    40
   ],
   "farmer_4_SE_w6": [
    837,
    305,
    22,
    45,
    10,
    40
   ],
   "farmer_4_SE_w7": [
    860,
    305,
    22,
    45,
    10,
    40
   ],
   "farmer_4_S_i1": [
    883,
    305,
    22,
    45,
    11,
    40
   ],
   "farmer_4_S_w0": [
    906,
    305,
    22,
    45,
    11,
    40
   ],
   "farmer_4_S_w1": [
    929,
    305,
    22,
    45,
    11,
    40
   ],
   "farmer_4_S_w2": [
    952,
    305,
    21,
    45,
    10,
    40
   ],
   "farmer_4_S_w3": [
    974,
    305,
    22,
    45,
    11,
    40
   ],
   "farmer_4_S_w5": [
    997,
    305,
    22,
    45,
    11,
    40
   ],
   "farmer_4_S_w6": [
    0,
    352,
    21,
    45,
    11,
    40
   ],
   "farmer_4_S_w7": [
    22,
    352,
    22,
    45,
    11,
    40
   ],
   "guard_3_NE_i0": [
    45,
    352,
    18,
    45,
    7,
    43
   ],
   "guard_3_NE_w6": [
    64,
    352,
    18,
    45,
    6,
    43
   ],
   "h_rogue_g0": [
    83,
    352,
    24,
    45,
    12,
    40
   ],
   "h_rogue_g1": [
    108,
    352,
    25,
    45,
    13,
    40
   ],
   "h_rogue_i1": [
    134,
    352,
    27,
    45,
    9,
    40
   ],
   "h_rogue_s0": [
    162,
    352,
    24,
    45,
    12,
    40
   ],
   "hooded_4_E_w3": [
    187,
    352,
    22,
    45,
    13,
    41
   ],
   "hooded_4_E_w7": [
    210,
    352,
    22,
    45,
    13,
    41
   ],
   "hooded_4_NE_w0": [
    233,
    352,
    24,
    45,
    11,
    41
   ],
   "hooded_4_NE_w2": [
    258,
    352,
    20,
    45,
    11,
    42
   ],
   "hooded_4_NE_w3": [
    279,
    352,
    21,
    45,
    12,
    41
   ],
   "hooded_4_NE_w4": [
    301,
    352,
    19,
    45,
    11,
    41
   ],
   "hooded_4_NE_w7": [
    321,
    352,
    23,
    45,
    11,
    41
   ],
   "hooded_4_N_w0": [
    345,
    352,
    18,
    45,
    9,
    41
   ],
   "hooded_4_N_w1": [
    364,
    352,
    17,
    45,
    9,
    41
   ],
   "hooded_4_N_w3": [
    382,
    352,
    19,
    45,
    10,
    41
   ],
   "hooded_4_N_w4": [
    402,
    352,
    18,
    45,
    9,
    41
   ],
   "hooded_4_N_w5": [
    421,
    352,
    17,
    45,
    8,
    41
   ],
   "hooded_4_N_w7": [
    439,
    352,
    19,
    45,
    9,
    41
   ],
   "monk_4_N_w3": [
    459,
    352,
    19,
    45,
    10,
    40
   ],
   "monk_4_N_w7": [
    479,
    352,
    19,
    45,
    9,
    40
   ],
   "noble_4_E_w0": [
    499,
    352,
    20,
    45,
    9,
    40
   ],
   "noble_4_E_w3": [
    520,
    352,
    18,
    45,
    9,
    40
   ],
   "noble_4_E_w4": [
    539,
    352,
    20,
    45,
    9,
    40
   ],
   "noble_4_E_w7": [
    560,
    352,
    18,
    45,
    9,
    40
   ],
   "noble_4_NE_w0": [
    579,
    352,
    21,
    45,
    9,
    40
   ],
   "noble_4_NE_w2": [
    601,
    352,
    17,
    45,
    9,
    41
   ],
   "noble_4_NE_w3": [
    619,
    352,
    18,
    45,
    9,
    40
   ],
   "noble_4_NE_w4": [
    638,
    352,
    16,
    45,
    8,
    40
   ],
   "noble_4_NE_w5": [
    655,
    352,
    16,
    45,
    8,
    40
   ],
   "noble_4_NE_w7": [
    672,
    352,
    21,
    45,
    9,
    40
   ],
   "noble_4_N_w0": [
    694,
    352,
    16,
    45,
    8,
    40
   ],
   "noble_4_N_w4": [
    711,
    352,
    16,
    45,
    8,
    40
   ],
   "noble_4_SE_w3": [
    728,
    352,
    21,
    45,
    9,
    40
   ],
   "orc_4_E_i1": [
    750,
    352,
    17,
    45,
    9,
    42
   ],
   "orc_4_E_w1": [
    768,
    352,
    17,
    45,
    9,
    43
   ],
   "orc_4_NE_i1": [
    786,
    352,
    21,
    45,
    9,
    42
   ],
   "orc_4_NE_w1": [
    808,
    352,
    24,
    45,
    11,
    43
   ],
   "orc_4_NE_w2": [
    833,
    352,
    21,
    45,
    9,
    44
   ],
   "orc_4_NE_w3": [
    855,
    352,
    20,
    45,
    8,
    43
   ],
   "orc_4_NE_w5": [
    876,
    352,
    20,
    45,
    8,
    43
   ],
   "orc_4_N_i0": [
    897,
    352,
    24,
    45,
    12,
    43
   ],
   "orc_4_SE_i1": [
    922,
    352,
    22,
    45,
    11,
    42
   ],
   "orc_4_SE_w0": [
    945,
    352,
    19,
    45,
    10,
    42
   ],
   "orc_4_SE_w1": [
    965,
    352,
    20,
    45,
    10,
    43
   ],
   "orc_4_SE_w2": [
    986,
    352,
    22,
    45,
    11,
    43
   ],
   "orc_4_SE_w3": [
    0,
    398,
    25,
    45,
    11,
    43
   ],
   "orc_4_SE_w7": [
    26,
    398,
    21,
    45,
    11,
    42
   ],
   "orc_4_S_i1": [
    48,
    398,
    24,
    45,
    12,
    42
   ],
   "orc_4_S_w2": [
    73,
    398,
    24,
    45,
    12,
    42
   ],
   "orc_4_S_w6": [
    98,
    398,
    24,
    45,
    13,
    42
   ],
   "witch_3_E_w0": [
    123,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_E_w1": [
    145,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_E_w2": [
    167,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_E_w3": [
    189,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_E_w5": [
    211,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_E_w6": [
    233,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_E_w7": [
    255,
    398,
    21,
    45,
    11,
    42
   ],
   "witch_3_NE_w1": [
    277,
    398,
    22,
    45,
    10,
    42
   ],
   "witch_3_NE_w2": [
    300,
    398,
    21,
    45,
    10,
    42
   ],
   "witch_3_NE_w3": [
    322,
    398,
    21,
    45,
    10,
    42
   ],
   "witch_3_NE_w6": [
    344,
    398,
    20,
    45,
    9,
    42
   ],
   "witch_3_NE_w7": [
    365,
    398,
    22,
    45,
    10,
    42
   ],
   "witch_3_N_w1": [
    388,
    398,
    17,
    45,
    9,
    42
   ],
   "witch_3_N_w2": [
    406,
    398,
    17,
    45,
    9,
    42
   ],
   "witch_3_N_w5": [
    424,
    398,
    17,
    45,
    8,
    42
   ],
   "witch_3_N_w6": [
    442,
    398,
    17,
    45,
    8,
    42
   ],
   "witch_3_SE_w0": [
    460,
    398,
    19,
    45,
    10,
    42
   ],
   "witch_3_SE_w1": [
    480,
    398,
    20,
    45,
    10,
    42
   ],
   "witch_3_SE_w2": [
    501,
    398,
    19,
    45,
    9,
    42
   ],
   "witch_3_SE_w3": [
    521,
    398,
    20,
    45,
    10,
    42
   ],
   "witch_3_SE_w5": [
    542,
    398,
    20,
    45,
    10,
    42
   ],
   "witch_3_SE_w6": [
    563,
    398,
    19,
    45,
    10,
    42
   ],
   "witch_3_SE_w7": [
    583,
    398,
    19,
    45,
    10,
    42
   ],
   "witch_3_S_w1": [
    603,
    398,
    17,
    45,
    8,
    42
   ],
   "witch_3_S_w2": [
    621,
    398,
    17,
    45,
    8,
    42
   ],
   "witch_3_S_w3": [
    639,
    398,
    17,
    45,
    8,
    42
   ],
   "witch_3_S_w5": [
    657,
    398,
    17,
    45,
    9,
    42
   ],
   "witch_3_S_w6": [
    675,
    398,
    17,
    45,
    9,
    42
   ],
   "witch_3_S_w7": [
    693,
    398,
    17,
    45,
    9,
    42
   ],
   "elder_4_E_w0": [
    711,
    398,
    25,
    44,
    13,
    40
   ],
   "elder_4_E_w1": [
    737,
    398,
    25,
    44,
    13,
    40
   ],
   "elder_4_E_w2": [
    763,
    398,
    24,
    44,
    13,
    40
   ],
   "elder_4_E_w3": [
    788,
    398,
    23,
    44,
    13,
    40
   ],
   "elder_4_E_w4": [
    812,
    398,
    24,
    44,
    13,
    40
   ],
   "elder_4_E_w5": [
    837,
    398,
    23,
    44,
    13,
    40
   ],
   "elder_4_E_w6": [
    861,
    398,
    24,
    44,
    13,
    40
   ],
   "elder_4_E_w7": [
    886,
    398,
    25,
    44,
    13,
    40
   ],
   "elder_4_NE_w0": [
    912,
    398,
    25,
    44,
    11,
    40
   ],
   "elder_4_NE_w1": [
    938,
    398,
    25,
    44,
    11,
    40
   ],
   "elder_4_NE_w3": [
    964,
    398,
    24,
    44,
    11,
    40
   ],
   "elder_4_NE_w4": [
    989,
    398,
    23,
    44,
    11,
    40
   ],
   "elder_4_NE_w5": [
    0,
    444,
    24,
    44,
    11,
    40
   ],
   "elder_4_NE_w6": [
    25,
    444,
    24,
    44,
    11,
    40
   ],
   "elder_4_NE_w7": [
    50,
    444,
    25,
    44,
    11,
    40
   ],
   "elder_4_N_i0": [
    76,
    444,
    18,
    44,
    9,
    41
   ],
   "elder_4_N_w4": [
    95,
    444,
    18,
    44,
    9,
    40
   ],
   "elder_4_SE_w2": [
    114,
    444,
    20,
    44,
    11,
    40
   ],
   "elf_4_NE_w0": [
    135,
    444,
    24,
    44,
    11,
    41
   ],
   "elf_4_N_w0": [
    160,
    444,
    16,
    44,
    8,
    41
   ],
   "elf_4_N_w4": [
    177,
    444,
    16,
    44,
    8,
    41
   ],
   "elf_4_SE_w4": [
    194,
    444,
    23,
    44,
    10,
    40
   ],
   "elf_4_S_w0": [
    218,
    444,
    16,
    44,
    8,
    40
   ],
   "elf_4_S_w4": [
    235,
    444,
    16,
    44,
    8,
    40
   ],
   "farmer_4_E_i1": [
    252,
    444,
    22,
    44,
    10,
    40
   ],
   "farmer_4_NE_w0": [
    275,
    444,
    24,
    44,
    10,
    41
   ],
   "farmer_4_NE_w7": [
    300,
    444,
    23,
    44,
    9,
    41
   ],
   "farmer_4_N_w2": [
    324,
    444,
    21,
    44,
    11,
    42
   ],
   "farmer_4_N_w3": [
    346,
    444,
    21,
    44,
    11,
    41
   ],
   "farmer_4_N_w6": [
    368,
    444,
    21,
    44,
    10,
    42
   ],
   "farmer_4_N_w7": [
    390,
    444,
    21,
    44,
    10,
    41
   ],
   "farmer_4_S_w4": [
    412,
    444,
    22,
    44,
    11,
    40
   ],
   "guard_3_NE_i1": [
    435,
    444,
    18,
    44,
    7,
    42
   ],
   "guard_3_NE_w1": [
    454,
    444,
    19,
    44,
    7,
    43
   ],
   "guard_3_NE_w2": [
    474,
    444,
    19,
    44,
    7,
    43
   ],
   "guard_3_NE_w3": [
    494,
    444,
    17,
    44,
    6,
    42
   ],
   "guard_3_NE_w4": [
    512,
    444,
    18,
    44,
    7,
    42
   ],
   "guard_3_NE_w5": [
    531,
    444,
    17,
    44,
    6,
    42
   ],
   "hooded_4_E_w0": [
    549,
    444,
    24,
    44,
    13,
    40
   ],
   "hooded_4_E_w1": [
    574,
    444,
    22,
    44,
    13,
    41
   ],
   "hooded_4_E_w2": [
    597,
    444,
    21,
    44,
    12,
    41
   ],
   "hooded_4_E_w4": [
    619,
    444,
    24,
    44,
    13,
    40
   ],
   "hooded_4_E_w5": [
    644,
    444,
    22,
    44,
    13,
    41
   ],
   "hooded_4_E_w6": [
    667,
    444,
    22,
    44,
    13,
    41
   ],
   "hooded_4_NE_i0": [
    690,
    444,
    19,
    44,
    10,
    41
   ],
   "hooded_4_NE_w1": [
    710,
    444,
    24,
    44,
    12,
    41
   ],
   "hooded_4_NE_w5": [
    735,
    444,
    20,
    44,
    11,
    41
   ],
   "hooded_4_NE_w6": [
    756,
    444,
    20,
    44,
    11,
    41
   ],
   "hooded_4_N_i0": [
    777,
    444,
    18,
    44,
    9,
    41
   ],
   "hooded_4_SE_i0": [
    796,
    444,
    19,
    44,
    10,
    41
   ],
   "hooded_4_SE_w2": [
    816,
    444,
    20,
    44,
    11,
    41
   ],
   "hooded_4_SE_w3": [
    837,
    444,
    23,
    44,
    11,
    40
   ],
   "hooded_4_SE_w4": [
    861,
    444,
    24,
    44,
    11,
    40
   ],
   "hooded_4_SE_w7": [
    886,
    444,
    20,
    44,
    11,
    40
   ],
   "hooded_4_S_i0": [
    907,
    444,
    18,
    44,
    9,
    41
   ],
   "hooded_4_S_w0": [
    926,
    444,
    18,
    44,
    9,
    40
   ],
   "hooded_4_S_w3": [
    945,
    444,
    19,
    44,
    9,
    40
   ],
   "hooded_4_S_w4": [
    965,
    444,
    18,
    44,
    9,
    40
   ],
   "hooded_4_S_w7": [
    984,
    444,
    19,
    44,
    10,
    40
   ],
   "maid_4_N_w0": [
    1004,
    444,
    18,
    44,
    9,
    40
   ],
   "maid_4_N_w4": [
    0,
    489,
    18,
    44,
    9,
    40
   ],
   "monk_4_E_w7": [
    19,
    489,
    18,
    44,
    9,
    39
   ],
   "monk_4_NE_w0": [
    38,
    489,
    22,
    44,
    9,
    39
   ],
   "monk_4_NE_w1": [
    61,
    489,
    21,
    44,
    9,
    40
   ],
   "monk_4_NE_w2": [
    83,
    489,
    19,
    44,
    10,
    40
   ],
   "monk_4_NE_w3": [
    103,
    489,
    19,
    44,
    10,
    40
   ],
   "monk_4_NE_w4": [
    123,
    489,
    17,
    44,
    9,
    39
   ],
   "monk_4_NE_w6": [
    141,
    489,
    18,
    44,
    9,
    40
   ],
   "monk_4_NE_w7": [
    160,
    489,
    21,
    44,
    9,
    39
   ],
   "monk_4_N_w0": [
    182,
    489,
    18,
    44,
    9,
    39
   ],
   "monk_4_N_w1": [
    201,
    489,
    17,
    44,
    9,
    40
   ],
   "monk_4_N_w2": [
    219,
    489,
    18,
    44,
    9,
    40
   ],
   "monk_4_N_w4": [
    238,
    489,
    18,
    44,
    9,
    39
   ],
   "monk_4_N_w5": [
    257,
    489,
    17,
    44,
    8,
    40
   ],
   "monk_4_N_w6": [
    275,
    489,
    18,
    44,
    9,
    40
   ],
   "monk_4_SE_w7": [
    294,
    489,
    19,
    44,
    10,
    39
   ],
   "noble_4_E_i0": [
    314,
    489,
    14,
    44,
    7,
    40
   ],
   "noble_4_E_w1": [
    329,
    489,
    18,
    44,
    9,
    40
   ],
   "noble_4_E_w2": [
    348,
    489,
    17,
    44,
    9,
    40
   ],
   "noble_4_E_w5": [
    366,
    489,
    18,
    44,
    9,
    40
   ],
   "noble_4_E_w6": [
    385,
    489,
    17,
    44,
    9,
    40
   ],
   "noble_4_NE_i0": [
    403,
    489,
    16,
    44,
    7,
    40
   ],
   "noble_4_NE_w1": [
    420,
    489,
    20,
    44,
    9,
    40
   ],
   "noble_4_N_i0": [
    441,
    489,
    18,
    44,
    9,
    40
   ],
   "noble_4_SE_i0": [
    460,
    489,
    16,
    44,
    7,
    40
   ],
   "noble_4_SE_w0": [
    477,
    489,
    16,
    44,
    8,
    39
   ],
   "noble_4_SE_w1": [
    494,
    489,
    16,
    44,
    8,
    40
   ],
   "noble_4_SE_w2": [
    511,
    489,
    18,
    44,
    9,
    40
   ],
   "noble_4_SE_w4": [
    530,
    489,
    22,
    44,
    9,
    39
   ],
   "noble_4_SE_w6": [
    553,
    489,
    17,
    44,
    9,
    40
   ],
   "noble_4_SE_w7": [
    571,
    489,
    18,
    44,
    9,
    39
   ],
   "noble_4_S_i0": [
    590,
    489,
    18,
    44,
    9,
    40
   ],
   "noble_4_S_w0": [
    609,
    489,
    16,
    44,
    8,
    39
   ],
   "noble_4_S_w2": [
    626,
    489,
    17,
    44,
    8,
    40
   ],
   "noble_4_S_w3": [
    644,
    489,
    18,
    44,
    9,
    39
   ],
   "noble_4_S_w4": [
    663,
    489,
    16,
    44,
    8,
    39
   ],
   "noble_4_S_w6": [
    680,
    489,
    17,
    44,
    9,
    40
   ],
   "noble_4_S_w7": [
    698,
    489,
    18,
    44,
    9,
    39
   ],
   "orc_4_E_w2": [
    717,
    489,
    18,
    44,
    9,
    43
   ],
   "orc_4_E_w3": [
    736,
    489,
    20,
    44,
    9,
    43
   ],
   "orc_4_N_i1": [
    757,
    489,
    24,
    44,
    12,
    42
   ],
   "orc_4_S_w3": [
    782,
    489,
    24,
    44,
    12,
    42
   ],
   "orc_4_S_w7": [
    807,
    489,
    24,
    44,
    13,
    42
   ],
   "peasant_4_N_w0": [
    832,
    489,
    18,
    44,
    9,
    40
   ],
   "peasant_4_N_w4": [
    851,
    489,
    18,
    44,
    9,
    40
   ],
   "witch_3_E_i0": [
    870,
    489,
    19,
    44,
    10,
    42
   ],
   "witch_3_E_w4": [
    890,
    489,
    21,
    44,
    11,
    41
   ],
   "witch_3_NE_w0": [
    912,
    489,
    22,
    44,
    10,
    41
   ],
   "witch_3_NE_w4": [
    935,
    489,
    21,
    44,
    10,
    41
   ],
   "witch_3_NE_w5": [
    957,
    489,
    21,
    44,
    10,
    41
   ],
   "witch_3_N_w0": [
    979,
    489,
    16,
    44,
    8,
    41
   ],
   "witch_3_N_w3": [
    996,
    489,
    17,
    44,
    9,
    41
   ],
   "witch_3_N_w4": [
    0,
    534,
    16,
    44,
    8,
    41
   ],
   "witch_3_N_w7": [
    17,
    534,
    17,
    44,
    8,
    41
   ],
   "witch_3_SE_i0": [
    35,
    534,
    18,
    44,
    9,
    42
   ],
   "witch_3_S_i0": [
    54,
    534,
    16,
    44,
    8,
    42
   ],
   "elder_4_E_i0": [
    71,
    534,
    22,
    43,
    11,
    40
   ],
   "elder_4_NE_i0": [
    94,
    534,
    23,
    43,
    10,
    40
   ],
   "elder_4_N_i1": [
    118,
    534,
    18,
    43,
    9,
    40
   ],
   "elder_4_SE_i0": [
    137,
    534,
    19,
    43,
    10,
    40
   ],
   "elder_4_SE_w0": [
    157,
    534,
    19,
    43,
    11,
    39
   ],
   "elder_4_SE_w1": [
    177,
    534,
    19,
    43,
    11,
    39
   ],
   "elder_4_SE_w3": [
    197,
    534,
    23,
    43,
    11,
    39
   ],
   "elder_4_SE_w4": [
    221,
    534,
    24,
    43,
    11,
    39
   ],
   "elder_4_SE_w5": [
    246,
    534,
    24,
    43,
    12,
    39
   ],
   "elder_4_SE_w6": [
    271,
    534,
    19,
    43,
    11,
    39
   ],
   "elder_4_SE_w7": [
    291,
    534,
    21,
    43,
    12,
    39
   ],
   "elder_4_S_i0": [
    313,
    534,
    18,
    43,
    9,
    40
   ],
   "elder_4_S_w0": [
    332,
    534,
    18,
    43,
    9,
    39
   ],
   "elder_4_S_w2": [
    351,
    534,
    18,
    43,
    9,
    39
   ],
   "elder_4_S_w3": [
    370,
    534,
    19,
    43,
    9,
    39
   ],
   "elder_4_S_w4": [
    390,
    534,
    18,
    43,
    9,
    39
   ],
   "elder_4_S_w6": [
    409,
    534,
    18,
    43,
    9,
    39
   ],
   "elder_4_S_w7": [
    428,
    534,
    19,
    43,
    10,
    39
   ],
   "elf_4_E_i0": [
    448,
    534,
    17,
    43,
    10,
    41
   ],
   "elf_4_E_w6": [
    466,
    534,
    20,
    43,
    12,
    41
   ],
   "elf_4_NE_i0": [
    487,
    534,
    17,
    43,
    9,
    41
   ],
   "elf_4_NE_w3": [
    505,
    534,
    19,
    43,
    11,
    41
   ],
   "elf_4_NE_w4": [
    525,
    534,
    19,
    43,
    11,
    41
   ],
   "elf_4_NE_w6": [
    545,
    534,
    19,
    43,
    10,
    41
   ],
   "elf_4_NE_w7": [
    565,
    534,
    22,
    43,
    10,
    41
   ],
   "elf_4_N_i0": [
    588,
    534,
    18,
    43,
    9,
    41
   ],
   "elf_4_N_w2": [
    607,
    534,
    16,
    43,
    8,
    41
   ],
   "elf_4_N_w3": [
    624,
    534,
    16,
    43,
    8,
    41
   ],
   "elf_4_N_w6": [
    641,
    534,
    16,
    43,
    8,
    41
   ],
   "elf_4_N_w7": [
    658,
    534,
    16,
    43,
    8,
    41
   ],
   "elf_4_SE_w0": [
    675,
    534,
    18,
    43,
    10,
    40
   ],
   "elf_4_SE_w5": [
    694,
    534,
    22,
    43,
    11,
    40
   ],
   "elf_4_S_w1": [
    717,
    534,
    16,
    43,
    8,
    40
   ],
   "elf_4_S_w5": [
    734,
    534,
    16,
    43,
    8,
    40
   ],
   "farmer_4_NE_i0": [
    751,
    534,
    23,
    43,
    10,
    41
   ],
   "farmer_4_NE_w1": [
    775,
    534,
    24,
    43,
    10,
    41
   ],
   "farmer_4_NE_w2": [
    800,
    534,
    23,
    43,
    10,
    42
   ],
   "farmer_4_NE_w3": [
    824,
    534,
    23,
    43,
    10,
    41
   ],
   "farmer_4_NE_w4": [
    848,
    534,
    23,
    43,
    10,
    41
   ],
   "farmer_4_NE_w5": [
    872,
    534,
    22,
    43,
    9,
    41
   ],
   "farmer_4_NE_w6": [
    895,
    534,
    23,
    43,
    9,
    41
   ],
   "farmer_4_N_i0": [
    919,
    534,
    22,
    43,
    11,
    41
   ],
   "guard_2_N_w0": [
    942,
    534,
    16,
    43,
    8,
    40
   ],
   "guard_2_N_w7": [
    959,
    534,
    16,
    43,
    8,
    41
   ],
   "guard_3_S_w0": [
    976,
    534,
    18,
    43,
    9,
    39
   ],
   "guard_3_S_w4": [
    995,
    534,
    18,
    43,
    9,
    39
   ],
   "hooded_4_E_i0": [
    0,
    579,
    19,
    43,
    11,
    41
   ],
   "hooded_4_NE_i1": [
    20,
    579,
    19,
    43,
    10,
    40
   ],
   "hooded_4_N_i1": [
    40,
    579,
    18,
    43,
    9,
    40
   ],
   "hooded_4_SE_i1": [
    59,
    579,
    19,
    43,
    10,
    40
   ],
   "hooded_4_SE_w0": [
    79,
    579,
    19,
    43,
    11,
    40
   ],
   "hooded_4_SE_w1": [
    99,
    579,
    20,
    43,
    11,
    40
   ],
   "hooded_4_SE_w5": [
    120,
    579,
    23,
    43,
    11,
    40
   ],
   "hooded_4_SE_w6": [
    144,
    579,
    20,
    43,
    11,
    40
   ],
   "hooded_4_S_i1": [
    165,
    579,
    18,
    43,
    9,
    40
   ],
   "hooded_4_S_w1": [
    184,
    579,
    17,
    43,
    8,
    40
   ],
   "hooded_4_S_w2": [
    202,
    579,
    18,
    43,
    9,
    40
   ],
   "hooded_4_S_w5": [
    221,
    579,
    17,
    43,
    9,
    40
   ],
   "hooded_4_S_w6": [
    239,
    579,
    18,
    43,
    9,
    40
   ],
   "maid_4_NE_w0": [
    258,
    579,
    22,
    43,
    9,
    40
   ],
   "maid_4_NE_w2": [
    281,
    579,
    18,
    43,
    10,
    41
   ],
   "maid_4_NE_w7": [
    300,
    579,
    21,
    43,
    9,
    40
   ],
   "maid_4_N_w2": [
    322,
    579,
    18,
    43,
    9,
    41
   ],
   "maid_4_N_w3": [
    341,
    579,
    19,
    43,
    10,
    40
   ],
   "maid_4_N_w6": [
    361,
    579,
    18,
    43,
    9,
    41
   ],
   "maid_4_N_w7": [
    380,
    579,
    19,
    43,
    9,
    40
   ],
   "maid_4_SE_i0": [
    400,
    579,
    16,
    43,
    7,
    40
   ],
   "maid_4_SE_w4": [
    417,
    579,
    22,
    43,
    9,
    39
   ],
   "maid_4_S_i0": [
    440,
    579,
    18,
    43,
    9,
    40
   ],
   "maid_4_S_w0": [
    459,
    579,
    18,
    43,
    9,
    39
   ],
   "maid_4_S_w4": [
    478,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_E_w0": [
    497,
    579,
    20,
    43,
    9,
    39
   ],
   "monk_4_E_w1": [
    518,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_E_w2": [
    537,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_E_w3": [
    556,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_E_w4": [
    575,
    579,
    20,
    43,
    9,
    39
   ],
   "monk_4_E_w5": [
    596,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_E_w6": [
    615,
    579,
    19,
    43,
    10,
    39
   ],
   "monk_4_NE_w5": [
    635,
    579,
    17,
    43,
    9,
    39
   ],
   "monk_4_N_i0": [
    653,
    579,
    18,
    43,
    9,
    40
   ],
   "monk_4_SE_w1": [
    672,
    579,
    17,
    43,
    9,
    39
   ],
   "monk_4_SE_w2": [
    690,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_SE_w3": [
    709,
    579,
    21,
    43,
    9,
    39
   ],
   "monk_4_SE_w5": [
    731,
    579,
    21,
    43,
    9,
    39
   ],
   "monk_4_SE_w6": [
    753,
    579,
    18,
    43,
    10,
    39
   ],
   "monk_4_S_w2": [
    772,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_S_w3": [
    791,
    579,
    19,
    43,
    9,
    38
   ],
   "monk_4_S_w6": [
    811,
    579,
    18,
    43,
    9,
    39
   ],
   "monk_4_S_w7": [
    830,
    579,
    19,
    43,
    10,
    38
   ],
   "noble_4_E_i1": [
    850,
    579,
    14,
    43,
    7,
    39
   ],
   "noble_4_NE_i1": [
    865,
    579,
    16,
    43,
    7,
    39
   ],
   "noble_4_N_i1": [
    882,
    579,
    18,
    43,
    9,
    39
   ],
   "noble_4_SE_i1": [
    901,
    579,
    16,
    43,
    7,
    39
   ],
   "noble_4_SE_w5": [
    918,
    579,
    20,
    43,
    9,
    39
   ],
   "noble_4_S_i1": [
    939,
    579,
    18,
    43,
    9,
    39
   ],
   "noble_4_S_w1": [
    958,
    579,
    17,
    43,
    8,
    39
   ],
   "noble_4_S_w5": [
    976,
    579,
    17,
    43,
    9,
    39
   ],
   "peasant_4_NE_w0": [
    994,
    579,
    22,
    43,
    9,
    40
   ],
   "peasant_4_NE_w7": [
    0,
    623,
    20,
    43,
    8,
    40
   ],
   "peasant_4_N_w2": [
    21,
    623,
    17,
    43,
    9,
    41
   ],
   "peasant_4_N_w3": [
    39,
    623,
    17,
    43,
    9,
    40
   ],
   "peasant_4_N_w6": [
    57,
    623,
    17,
    43,
    8,
    41
   ],
   "peasant_4_N_w7": [
    75,
    623,
    17,
    43,
    8,
    40
   ],
   "peasant_4_SE_i0": [
    93,
    623,
    16,
    43,
    7,
    40
   ],
   "peasant_4_SE_w4": [
    110,
    623,
    22,
    43,
    9,
    39
   ],
   "peasant_4_SE_w6": [
    133,
    623,
    15,
    43,
    7,
    40
   ],
   "peasant_4_S_i0": [
    149,
    623,
    18,
    43,
    9,
    40
   ],
   "peasant_4_S_w0": [
    168,
    623,
    18,
    43,
    9,
    39
   ],
   "peasant_4_S_w4": [
    187,
    623,
    18,
    43,
    9,
    39
   ],
   "witch_3_E_i1": [
    206,
    623,
    19,
    43,
    10,
    41
   ],
   "witch_3_NE_i0": [
    226,
    623,
    20,
    43,
    9,
    41
   ],
   "witch_3_NE_i1": [
    247,
    623,
    20,
    43,
    9,
    41
   ],
   "witch_3_N_i0": [
    268,
    623,
    16,
    43,
    8,
    41
   ],
   "witch_3_SE_i1": [
    285,
    623,
    18,
    43,
    9,
    41
   ],
   "witch_3_S_i1": [
    304,
    623,
    16,
    43,
    8,
    41
   ],
   "elder_4_E_i1": [
    321,
    623,
    22,
    42,
    11,
    39
   ],
   "elder_4_NE_i1": [
    344,
    623,
    23,
    42,
    10,
    39
   ],
   "elder_4_SE_i1": [
    368,
    623,
    19,
    42,
    10,
    39
   ],
   "elder_4_S_i1": [
    388,
    623,
    18,
    42,
    9,
    39
   ],
   "elder_4_S_w1": [
    407,
    623,
    18,
    42,
    9,
    39
   ],
   "elder_4_S_w5": [
    426,
    623,
    17,
    42,
    9,
    39
   ],
   "elf_4_E_i1": [
    444,
    623,
    17,
    42,
    10,
    40
   ],
   "elf_4_E_w0": [
    462,
    623,
    23,
    42,
    12,
    40
   ],
   "elf_4_E_w1": [
    486,
    623,
    22,
    42,
    12,
    41
   ],
   "elf_4_E_w2": [
    509,
    623,
    20,
    42,
    12,
    41
   ],
   "elf_4_E_w3": [
    530,
    623,
    22,
    42,
    12,
    41
   ],
   "elf_4_E_w4": [
    553,
    623,
    23,
    42,
    12,
    40
   ],
   "elf_4_E_w5": [
    577,
    623,
    22,
    42,
    12,
    40
   ],
   "elf_4_E_w7": [
    600,
    623,
    22,
    42,
    12,
    40
   ],
   "elf_4_NE_i1": [
    623,
    623,
    17,
    42,
    9,
    40
   ],
   "elf_4_NE_w1": [
    641,
    623,
    22,
    42,
    11,
    41
   ],
   "elf_4_NE_w2": [
    664,
    623,
    18,
    42,
    10,
    41
   ],
   "elf_4_NE_w5": [
    683,
    623,
    17,
    42,
    10,
    41
   ],
   "elf_4_N_i1": [
    701,
    623,
    18,
    42,
    9,
    40
   ],
   "elf_4_N_w1": [
    720,
    623,
    16,
    42,
    8,
    41
   ],
   "elf_4_N_w5": [
    737,
    623,
    16,
    42,
    8,
    41
   ],
   "elf_4_SE_i0": [
    754,
    623,
    17,
    42,
    9,
    40
   ],
   "elf_4_SE_w1": [
    772,
    623,
    17,
    42,
    10,
    40
   ],
   "elf_4_SE_w2": [
    790,
    623,
    19,
    42,
    10,
    40
   ],
   "elf_4_SE_w6": [
    810,
    623,
    18,
    42,
    10,
    40
   ],
   "elf_4_SE_w7": [
    829,
    623,
    19,
    42,
    11,
    40
   ],
   "elf_4_S_i0": [
    849,
    623,
    18,
    42,
    9,
    40
   ],
   "elf_4_S_w2": [
    868,
    623,
    16,
    42,
    8,
    40
   ],
   "elf_4_S_w3": [
    885,
    623,
    16,
    42,
    8,
    40
   ],
   "elf_4_S_w6": [
    902,
    623,
    16,
    42,
    8,
    40
   ],
   "elf_4_S_w7": [
    919,
    623,
    16,
    42,
    8,
    40
   ],
   "farmer_4_NE_i1": [
    936,
    623,
    23,
    42,
    10,
    40
   ],
   "farmer_4_N_i1": [
    960,
    623,
    22,
    42,
    11,
    40
   ],
   "farmer_4_N_w1": [
    983,
    623,
    21,
    42,
    11,
    41
   ],
   "farmer_4_N_w5": [
    0,
    667,
    21,
    42,
    10,
    41
   ],
   "guard_2_N_i0": [
    22,
    667,
    16,
    42,
    8,
    40
   ],
   "guard_2_N_w1": [
    39,
    667,
    16,
    42,
    8,
    41
   ],
   "guard_2_N_w2": [
    56,
    667,
    15,
    42,
    8,
    40
   ],
   "guard_2_N_w3": [
    72,
    667,
    16,
    42,
    8,
    40
   ],
   "guard_2_N_w4": [
    89,
    667,
    16,
    42,
    8,
    39
   ],
   "guard_2_N_w6": [
    106,
    667,
    15,
    42,
    7,
    40
   ],
   "guard_3_E_i0": [
    122,
    667,
    16,
    42,
    7,
    40
   ],
   "guard_3_E_w0": [
    139,
    667,
    18,
    42,
    7,
    40
   ],
   "guard_3_E_w4": [
    158,
    667,
    17,
    42,
    7,
    40
   ],
   "guard_3_E_w5": [
    176,
    667,
    15,
    42,
    6,
    40
   ],
   "guard_3_E_w6": [
    192,
    667,
    16,
    42,
    6,
    40
   ],
   "guard_3_E_w7": [
    209,
    667,
    16,
    42,
    6,
    40
   ],
   "guard_3_SE_w4": [
    226,
    667,
    18,
    42,
    7,
    38
   ],
   "guard_3_SE_w5": [
    245,
    667,
    17,
    42,
    7,
    39
   ],
   "guard_3_S_i0": [
    263,
    667,
    18,
    42,
    9,
    40
   ],
   "guard_3_S_w1": [
    282,
    667,
    17,
    42,
    8,
    39
   ],
   "guard_3_S_w2": [
    300,
    667,
    17,
    42,
    8,
    40
   ],
   "guard_3_S_w5": [
    318,
    667,
    17,
    42,
    9,
    39
   ],
   "hooded_4_E_i1": [
    336,
    667,
    19,
    42,
    11,
    40
   ],
   "maid_4_E_i0": [
    356,
    667,
    15,
    42,
    8,
    40
   ],
   "maid_4_E_w0": [
    372,
    667,
    20,
    42,
    9,
    40
   ],
   "maid_4_E_w1": [
    393,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_E_w2": [
    412,
    667,
    19,
    42,
    10,
    40
   ],
   "maid_4_E_w3": [
    432,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_E_w4": [
    451,
    667,
    20,
    42,
    9,
    40
   ],
   "maid_4_E_w5": [
    472,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_E_w6": [
    491,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_E_w7": [
    510,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_NE_i0": [
    529,
    667,
    16,
    42,
    7,
    40
   ],
   "maid_4_NE_w1": [
    546,
    667,
    21,
    42,
    9,
    40
   ],
   "maid_4_NE_w3": [
    568,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_NE_w4": [
    587,
    667,
    17,
    42,
    9,
    40
   ],
   "maid_4_NE_w5": [
    605,
    667,
    17,
    42,
    9,
    40
   ],
   "maid_4_NE_w6": [
    623,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_N_i0": [
    642,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_N_w1": [
    661,
    667,
    17,
    42,
    9,
    40
   ],
   "maid_4_N_w5": [
    679,
    667,
    17,
    42,
    8,
    40
   ],
   "maid_4_SE_i1": [
    697,
    667,
    16,
    42,
    7,
    39
   ],
   "maid_4_SE_w0": [
    714,
    667,
    17,
    42,
    9,
    39
   ],
   "maid_4_SE_w2": [
    732,
    667,
    18,
    42,
    9,
    40
   ],
   "maid_4_SE_w5": [
    751,
    667,
    21,
    42,
    9,
    39
   ],
   "maid_4_SE_w6": [
    773,
    667,
    18,
    42,
    10,
    39
   ],
   "maid_4_S_i1": [
    792,
    667,
    18,
    42,
    9,
    39
   ],
   "maid_4_S_w1": [
    811,
    667,
    17,
    42,
    8,
    39
   ],
   "maid_4_S_w2": [
    829,
    667,
    18,
    42,
    9,
    39
   ],
   "maid_4_S_w5": [
    848,
    667,
    17,
    42,
    9,
    39
   ],
   "maid_4_S_w6": [
    866,
    667,
    18,
    42,
    9,
    39
   ],
   "mercenary_4_NE_i0": [
    885,
    667,
    17,
    42,
    8,
    40
   ],
   "mercenary_4_NE_t0": [
    903,
    667,
    21,
    42,
    8,
    40
   ],
   "mercenary_4_NE_t1": [
    925,
    667,
    21,
    42,
    8,
    40
   ],
   "monk_4_E_i0": [
    947,
    667,
    14,
    42,
    7,
    39
   ],
   "monk_4_NE_i0": [
    962,
    667,
    16,
    42,
    7,
    39
   ],
   "monk_4_N_i1": [
    979,
    667,
    18,
    42,
    9,
    39
   ],
   "monk_4_SE_i0": [
    998,
    667,
    16,
    42,
    7,
    39
   ],
   "monk_4_SE_w0": [
    0,
    710,
    17,
    42,
    9,
    38
   ],
   "monk_4_SE_w4": [
    18,
    710,
    22,
    42,
    9,
    38
   ],
   "monk_4_S_i0": [
    41,
    710,
    18,
    42,
    9,
    39
   ],
   "monk_4_S_w0": [
    60,
    710,
    18,
    42,
    9,
    38
   ],
   "monk_4_S_w1": [
    79,
    710,
    17,
    42,
    8,
    38
   ],
   "monk_4_S_w4": [
    97,
    710,
    18,
    42,
    9,
    38
   ],
   "monk_4_S_w5": [
    116,
    710,
    17,
    42,
    9,
    38
   ],
   "orc_3_NE_w0": [
    134,
    710,
    22,
    42,
    10,
    38
   ],
   "peasant_4_E_i0": [
    157,
    710,
    14,
    42,
    6,
    40
   ],
   "peasant_4_E_w0": [
    172,
    710,
    19,
    42,
    8,
    40
   ],
   "peasant_4_E_w4": [
    192,
    710,
    19,
    42,
    8,
    40
   ],
   "peasant_4_E_w5": [
    212,
    710,
    15,
    42,
    6,
    40
   ],
   "peasant_4_E_w6": [
    228,
    710,
    13,
    42,
    5,
    40
   ],
   "peasant_4_E_w7": [
    242,
    710,
    15,
    42,
    6,
    40
   ],
   "peasant_4_NE_i0": [
    258,
    710,
    16,
    42,
    7,
    40
   ],
   "peasant_4_NE_w1": [
    275,
    710,
    20,
    42,
    8,
    40
   ],
   "peasant_4_NE_w2": [
    296,
    710,
    15,
    42,
    7,
    41
   ],
   "peasant_4_NE_w3": [
    312,
    710,
    15,
    42,
    6,
    40
   ],
   "peasant_4_NE_w4": [
    328,
    710,
    15,
    42,
    7,
    40
   ],
   "peasant_4_NE_w5": [
    344,
    710,
    13,
    42,
    6,
    40
   ],
   "peasant_4_NE_w6": [
    358,
    710,
    15,
    42,
    6,
    40
   ],
   "peasant_4_N_i0": [
    374,
    710,
    18,
    42,
    9,
    40
   ],
   "peasant_4_SE_i1": [
    393,
    710,
    16,
    42,
    7,
    39
   ],
   "peasant_4_SE_w0": [
    410,
    710,
    15,
    42,
    7,
    39
   ],
   "peasant_4_SE_w2": [
    426,
    710,
    15,
    42,
    6,
    40
   ],
   "peasant_4_SE_w5": [
    442,
    710,
    20,
    42,
    8,
    39
   ],
   "peasant_4_S_i1": [
    463,
    710,
    18,
    42,
    9,
    39
   ],
   "peasant_4_S_w1": [
    482,
    710,
    17,
    42,
    8,
    39
   ],
   "peasant_4_S_w2": [
    500,
    710,
    17,
    42,
    8,
    39
   ],
   "peasant_4_S_w5": [
    518,
    710,
    17,
    42,
    9,
    39
   ],
   "peasant_4_S_w6": [
    536,
    710,
    17,
    42,
    9,
    39
   ],
   "witch_3_N_i1": [
    554,
    710,
    16,
    42,
    8,
    40
   ],
   "elder_3_N_w0": [
    571,
    710,
    16,
    41,
    8,
    37
   ],
   "elder_3_N_w1": [
    588,
    710,
    16,
    41,
    8,
    37
   ],
   "elder_3_N_w7": [
    605,
    710,
    17,
    41,
    8,
    37
   ],
   "elf_4_SE_i1": [
    623,
    710,
    18,
    41,
    9,
    39
   ],
   "elf_4_SE_w3": [
    642,
    710,
    22,
    41,
    10,
    40
   ],
   "elf_4_S_i1": [
    665,
    710,
    18,
    41,
    9,
    39
   ],
   "farmer_3_SE_i0": [
    684,
    710,
    19,
    41,
    9,
    36
   ],
   "farmer_3_SE_w1": [
    704,
    710,
    19,
    41,
    8,
    36
   ],
   "farmer_3_SE_w2": [
    724,
    710,
    19,
    41,
    8,
    36
   ],
   "farmer_3_SE_w3": [
    744,
    710,
    19,
    41,
    8,
    36
   ],
   "farmer_3_SE_w5": [
    764,
    710,
    20,
    41,
    9,
    36
   ],
   "farmer_3_SE_w6": [
    785,
    710,
    19,
    41,
    9,
    36
   ],
   "farmer_3_SE_w7": [
    805,
    710,
    20,
    41,
    9,
    36
   ],
   "guard_2_NE_w0": [
    826,
    710,
    18,
    41,
    7,
    38
   ],
   "guard_2_N_i1": [
    845,
    710,
    16,
    41,
    8,
    39
   ],
   "guard_2_N_w5": [
    862,
    710,
    16,
    41,
    8,
    40
   ],
   "guard_3_E_i1": [
    879,
    710,
    16,
    41,
    7,
    39
   ],
   "guard_3_E_w1": [
    896,
    710,
    16,
    41,
    6,
    40
   ],
   "guard_3_E_w2": [
    913,
    710,
    16,
    41,
    6,
    40
   ],
   "guard_3_E_w3": [
    930,
    710,
    15,
    41,
    6,
    40
   ],
   "guard_3_SE_i0": [
    946,
    710,
    15,
    41,
    7,
    39
   ],
   "guard_3_SE_w0": [
    962,
    710,
    15,
    41,
    7,
    38
   ],
   "guard_3_SE_w1": [
    978,
    710,
    14,
    41,
    6,
    39
   ],
   "guard_3_SE_w2": [
    993,
    710,
    14,
    41,
    6,
    39
   ],
   "guard_3_SE_w6": [
    1008,
    710,
    15,
    41,
    7,
    39
   ],
   "guard_3_SE_w7": [
    0,
    753,
    14,
    41,
    6,
    39
   ],
   "guard_3_S_i1": [
    15,
    753,
    18,
    41,
    9,
    39
   ],
   "guard_3_S_w3": [
    34,
    753,
    17,
    41,
    8,
    39
   ],
   "guard_3_S_w6": [
    52,
    753,
    17,
    41,
    9,
    39
   ],
   "guard_3_S_w7": [
    70,
    753,
    17,
    41,
    9,
    39
   ],
   "hooded_3_N_w1": [
    88,
    753,
    16,
    41,
    8,
    37
   ],
   "hooded_3_N_w3": [
    105,
    753,
    17,
    41,
    9,
    37
   ],
   "hooded_3_N_w5": [
    123,
    753,
    16,
    41,
    8,
    37
   ],
   "hooded_3_N_w7": [
    140,
    753,
    17,
    41,
    8,
    37
   ],
   "maid_4_E_i1": [
    158,
    753,
    15,
    41,
    8,
    39
   ],
   "maid_4_NE_i1": [
    174,
    753,
    16,
    41,
    7,
    39
   ],
   "maid_4_N_i1": [
    191,
    753,
    18,
    41,
    9,
    39
   ],
   "maid_4_SE_w1": [
    210,
    753,
    17,
    41,
    9,
    39
   ],
   "maid_4_SE_w3": [
    228,
    753,
    21,
    41,
    9,
    39
   ],
   "maid_4_SE_w7": [
    250,
    753,
    18,
    41,
    9,
    39
   ],
   "maid_4_S_w3": [
    269,
    753,
    19,
    41,
    9,
    39
   ],
   "maid_4_S_w7": [
    289,
    753,
    19,
    41,
    10,
    39
   ],
   "mercenary_4_NE_i1": [
    309,
    753,
    17,
    41,
    8,
    39
   ],
   "monk_4_E_i1": [
    327,
    753,
    14,
    41,
    7,
    38
   ],
   "monk_4_NE_i1": [
    342,
    753,
    16,
    41,
    7,
    38
   ],
   "monk_4_SE_i1": [
    359,
    753,
    16,
    41,
    7,
    38
   ],
   "monk_4_S_i1": [
    376,
    753,
    18,
    41,
    9,
    38
   ],
   "orc_3_E_i0": [
    395,
    753,
    15,
    41,
    8,
    38
   ],
   "orc_3_E_t0": [
    411,
    753,
    18,
    41,
    8,
    38
   ],
   "orc_3_E_t1": [
    430,
    753,
    17,
    41,
    7,
    38
   ],
   "orc_3_E_w0": [
    448,
    753,
    16,
    41,
    7,
    38
   ],
   "orc_3_E_w4": [
    465,
    753,
    19,
    41,
    8,
    38
   ],
   "orc_3_E_w5": [
    485,
    753,
    18,
    41,
    8,
    38
   ],
   "orc_3_E_w6": [
    504,
    753,
    16,
    41,
    8,
    38
   ],
   "orc_3_E_w7": [
    521,
    753,
    17,
    41,
    8,
    38
   ],
   "orc_3_NE_i0": [
    539,
    753,
    19,
    41,
    8,
    38
   ],
   "orc_3_NE_w6": [
    559,
    753,
    18,
    41,
    7,
    38
   ],
   "orc_3_NE_w7": [
    578,
    753,
    21,
    41,
    9,
    38
   ],
   "orc_3_N_w0": [
    600,
    753,
    21,
    41,
    10,
    38
   ],
   "orc_3_N_w2": [
    622,
    753,
    22,
    41,
    11,
    39
   ],
   "orc_3_N_w3": [
    645,
    753,
    21,
    41,
    10,
    38
   ],
   "orc_3_N_w4": [
    667,
    753,
    21,
    41,
    10,
    38
   ],
   "orc_3_N_w6": [
    689,
    753,
    21,
    41,
    10,
    39
   ],
   "orc_3_N_w7": [
    711,
    753,
    21,
    41,
    10,
    38
   ],
   "orc_3_SE_i0": [
    733,
    753,
    20,
    41,
    10,
    38
   ],
   "orc_3_SE_w4": [
    754,
    753,
    24,
    41,
    10,
    37
   ],
   "orc_3_SE_w6": [
    779,
    753,
    19,
    41,
    10,
    38
   ],
   "orc_3_S_i0": [
    799,
    753,
    22,
    41,
    11,
    38
   ],
   "orc_3_S_w0": [
    822,
    753,
    21,
    41,
    11,
    37
   ],
   "orc_3_S_w2": [
    844,
    753,
    22,
    41,
    11,
    38
   ],
   "orc_3_S_w4": [
    867,
    753,
    21,
    41,
    11,
    37
   ],
   "orc_3_S_w6": [
    889,
    753,
    21,
    41,
    11,
    38
   ],
   "peasant_4_E_i1": [
    911,
    753,
    14,
    41,
    6,
    39
   ],
   "peasant_4_E_w1": [
    926,
    753,
    15,
    41,
    6,
    40
   ],
   "peasant_4_E_w2": [
    942,
    753,
    13,
    41,
    5,
    40
   ],
   "peasant_4_E_w3": [
    956,
    753,
    15,
    41,
    6,
    40
   ],
   "peasant_4_NE_i1": [
    972,
    753,
    16,
    41,
    7,
    39
   ],
   "peasant_4_N_i1": [
    989,
    753,
    18,
    41,
    9,
    39
   ],
   "peasant_4_N_w1": [
    0,
    795,
    17,
    41,
    9,
    40
   ],
   "peasant_4_N_w5": [
    18,
    795,
    17,
    41,
    8,
    40
   ],
   "peasant_4_SE_w1": [
    36,
    795,
    13,
    41,
    6,
    39
   ],
   "peasant_4_SE_w3": [
    50,
    795,
    20,
    41,
    8,
    39
   ],
   "peasant_4_SE_w7": [
    71,
    795,
    15,
    41,
    6,
    39
   ],
   "peasant_4_S_w3": [
    87,
    795,
    17,
    41,
    8,
    39
   ],
   "peasant_4_S_w7": [
    105,
    795,
    17,
    41,
    9,
    39
   ],
   "witch_2_E_w2": [
    123,
    795,
    19,
    41,
    10,
    38
   ],
   "witch_2_SE_w2": [
    143,
    795,
    17,
    41,
    8,
    38
   ],
   "witch_2_S_w2": [
    161,
    795,
    15,
    41,
    7,
    38
   ],
   "witch_2_S_w6": [
    177,
    795,
    15,
    41,
    8,
    38
   ],
   "elder_3_NE_w1": [
    193,
    795,
    22,
    40,
    10,
    36
   ],
   "elder_3_NE_w2": [
    216,
    795,
    22,
    40,
    10,
    36
   ],
   "elder_3_NE_w3": [
    239,
    795,
    21,
    40,
    10,
    36
   ],
   "elder_3_NE_w6": [
    261,
    795,
    21,
    40,
    9,
    36
   ],
   "elder_3_N_w2": [
    283,
    795,
    16,
    40,
    8,
    36
   ],
   "elder_3_N_w3": [
    300,
    795,
    17,
    40,
    9,
    36
   ],
   "elder_3_N_w5": [
    318,
    795,
    16,
    40,
    8,
    36
   ],
   "elder_3_N_w6": [
    335,
    795,
    16,
    40,
    8,
    36
   ],
   "farmer_3_E_i0": [
    352,
    795,
    19,
    40,
    9,
    36
   ],
   "farmer_3_E_w0": [
    372,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w1": [
    392,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w2": [
    412,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w3": [
    432,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w4": [
    452,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w5": [
    472,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w6": [
    492,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_E_w7": [
    512,
    795,
    19,
    40,
    8,
    36
   ],
   "farmer_3_N_w3": [
    532,
    795,
    19,
    40,
    10,
    37
   ],
   "farmer_3_N_w7": [
    552,
    795,
    19,
    40,
    9,
    37
   ],
   "farmer_3_SE_i1": [
    572,
    795,
    19,
    40,
    9,
    35
   ],
   "farmer_3_SE_w0": [
    592,
    795,
    20,
    40,
    9,
    35
   ],
   "farmer_3_SE_w4": [
    613,
    795,
    20,
    40,
    9,
    35
   ],
   "farmer_3_S_i0": [
    634,
    795,
    20,
    40,
    10,
    36
   ],
   "farmer_3_S_w0": [
    655,
    795,
    20,
    40,
    10,
    35
   ],
   "farmer_3_S_w1": [
    676,
    795,
    19,
    40,
    9,
    35
   ],
   "farmer_3_S_w2": [
    696,
    795,
    19,
    40,
    9,
    36
   ],
   "farmer_3_S_w6": [
    716,
    795,
    19,
    40,
    10,
    36
   ],
   "farmer_3_S_w7": [
    736,
    795,
    19,
    40,
    10,
    35
   ],
   "guard_1_N_w0": [
    756,
    795,
    14,
    40,
    7,
    37
   ],
   "guard_2_NE_i0": [
    771,
    795,
    16,
    40,
    6,
    38
   ],
   "guard_2_NE_w3": [
    788,
    795,
    16,
    40,
    6,
    38
   ],
   "guard_2_NE_w6": [
    805,
    795,
    17,
    40,
    6,
    38
   ],
   "guard_2_NE_w7": [
    823,
    795,
    17,
    40,
    6,
    38
   ],
   "guard_3_SE_i1": [
    841,
    795,
    15,
    40,
    7,
    38
   ],
   "guard_3_SE_w3": [
    857,
    795,
    18,
    40,
    7,
    38
   ],
   "hooded_3_NE_w2": [
    876,
    795,
    18,
    40,
    10,
    37
   ],
   "hooded_3_NE_w6": [
    895,
    795,
    17,
    40,
    9,
    37
   ],
   "hooded_3_N_w0": [
    913,
    795,
    16,
    40,
    8,
    36
   ],
   "hooded_3_N_w2": [
    930,
    795,
    16,
    40,
    8,
    37
   ],
   "hooded_3_N_w4": [
    947,
    795,
    16,
    40,
    8,
    36
   ],
   "hooded_3_N_w6": [
    964,
    795,
    16,
    40,
    8,
    37
   ],
   "noble_3_E_w2": [
    981,
    795,
    16,
    40,
    8,
    36
   ],
   "noble_3_NE_w1": [
    998,
    795,
    18,
    40,
    8,
    36
   ],
   "noble_3_NE_w2": [
    0,
    837,
    15,
    40,
    8,
    36
   ],
   "noble_3_NE_w3": [
    16,
    837,
    16,
    40,
    8,
    36
   ],
   "noble_3_NE_w5": [
    33,
    837,
    15,
    40,
    8,
    36
   ],
   "noble_3_NE_w6": [
    49,
    837,
    16,
    40,
    8,
    36
   ],
   "noble_3_NE_w7": [
    66,
    837,
    18,
    40,
    8,
    36
   ],
   "noble_3_N_w0": [
    85,
    837,
    14,
    40,
    7,
    36
   ],
   "noble_3_N_w1": [
    100,
    837,
    15,
    40,
    8,
    36
   ],
   "noble_3_N_w2": [
    116,
    837,
    16,
    40,
    8,
    36
   ],
   "noble_3_N_w3": [
    133,
    837,
    16,
    40,
    8,
    36
   ],
   "noble_3_N_w4": [
    150,
    837,
    14,
    40,
    7,
    36
   ],
   "noble_3_N_w5": [
    165,
    837,
    15,
    40,
    7,
    36
   ],
   "noble_3_N_w6": [
    181,
    837,
    16,
    40,
    8,
    36
   ],
   "noble_3_N_w7": [
    198,
    837,
    16,
    40,
    8,
    36
   ],
   "orc_3_E_i1": [
    215,
    837,
    15,
    40,
    8,
    37
   ],
   "orc_3_E_w1": [
    231,
    837,
    16,
    40,
    8,
    38
   ],
   "orc_3_NE_i1": [
    248,
    837,
    19,
    40,
    8,
    37
   ],
   "orc_3_NE_w1": [
    268,
    837,
    20,
    40,
    9,
    38
   ],
   "orc_3_NE_w2": [
    289,
    837,
    19,
    40,
    8,
    39
   ],
   "orc_3_NE_w3": [
    309,
    837,
    17,
    40,
    7,
    38
   ],
   "orc_3_NE_w4": [
    327,
    837,
    17,
    40,
    7,
    38
   ],
   "orc_3_NE_w5": [
    345,
    837,
    18,
    40,
    7,
    38
   ],
   "orc_3_N_i0": [
    364,
    837,
    22,
    40,
    11,
    38
   ],
   "orc_3_N_w1": [
    387,
    837,
    21,
    40,
    10,
    38
   ],
   "orc_3_N_w5": [
    409,
    837,
    21,
    40,
    10,
    38
   ],
   "orc_3_SE_i1": [
    431,
    837,
    20,
    40,
    10,
    37
   ],
   "orc_3_SE_w0": [
    452,
    837,
    17,
    40,
    9,
    37
   ],
   "orc_3_SE_w1": [
    470,
    837,
    18,
    40,
    9,
    38
   ],
   "orc_3_SE_w2": [
    489,
    837,
    20,
    40,
    10,
    38
   ],
   "orc_3_SE_w3": [
    510,
    837,
    23,
    40,
    10,
    38
   ],
   "orc_3_SE_w5": [
    534,
    837,
    22,
    40,
    10,
    37
   ],
   "orc_3_S_i1": [
    557,
    837,
    22,
    40,
    11,
    37
   ],
   "orc_3_S_w1": [
    580,
    837,
    21,
    40,
    11,
    37
   ],
   "orc_3_S_w5": [
    602,
    837,
    21,
    40,
    11,
    37
   ],
   "witch_2_E_w0": [
    624,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_E_w1": [
    644,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_E_w3": [
    664,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_E_w4": [
    684,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_E_w5": [
    704,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_E_w6": [
    724,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_E_w7": [
    744,
    837,
    19,
    40,
    10,
    37
   ],
   "witch_2_NE_w0": [
    764,
    837,
    20,
    40,
    9,
    37
   ],
   "witch_2_NE_w1": [
    785,
    837,
    19,
    40,
    9,
    37
   ],
   "witch_2_NE_w2": [
    805,
    837,
    19,
    40,
    9,
    37
   ],
   "witch_2_NE_w3": [
    825,
    837,
    19,
    40,
    9,
    37
   ],
   "witch_2_NE_w4": [
    845,
    837,
    19,
    40,
    9,
    37
   ],
   "witch_2_NE_w5": [
    865,
    837,
    19,
    40,
    9,
    37
   ],
   "witch_2_NE_w6": [
    885,
    837,
    18,
    40,
    8,
    37
   ],
   "witch_2_NE_w7": [
    904,
    837,
    20,
    40,
    9,
    37
   ],
   "witch_2_N_w0": [
    925,
    837,
    14,
    40,
    7,
    37
   ],
   "witch_2_N_w1": [
    940,
    837,
    15,
    40,
    8,
    37
   ],
   "witch_2_N_w2": [
    956,
    837,
    15,
    40,
    8,
    37
   ],
   "witch_2_N_w3": [
    972,
    837,
    15,
    40,
    8,
    37
   ],
   "witch_2_N_w4": [
    988,
    837,
    14,
    40,
    7,
    37
   ],
   "witch_2_N_w5": [
    1003,
    837,
    15,
    40,
    7,
    37
   ],
   "witch_2_N_w6": [
    0,
    878,
    15,
    40,
    7,
    37
   ],
   "witch_2_N_w7": [
    16,
    878,
    15,
    40,
    7,
    37
   ],
   "witch_2_SE_i0": [
    32,
    878,
    16,
    40,
    8,
    38
   ],
   "witch_2_SE_w0": [
    49,
    878,
    17,
    40,
    9,
    37
   ],
   "witch_2_SE_w1": [
    67,
    878,
    18,
    40,
    9,
    37
   ],
   "witch_2_SE_w3": [
    86,
    878,
    18,
    40,
    9,
    37
   ],
   "witch_2_SE_w4": [
    105,
    878,
    19,
    40,
    9,
    37
   ],
   "witch_2_SE_w5": [
    125,
    878,
    18,
    40,
    9,
    37
   ],
   "witch_2_SE_w6": [
    144,
    878,
    17,
    40,
    9,
    37
   ],
   "witch_2_SE_w7": [
    162,
    878,
    17,
    40,
    9,
    37
   ],
   "witch_2_S_i0": [
    180,
    878,
    16,
    40,
    8,
    38
   ],
   "witch_2_S_w0": [
    197,
    878,
    14,
    40,
    7,
    37
   ],
   "witch_2_S_w1": [
    212,
    878,
    15,
    40,
    7,
    37
   ],
   "witch_2_S_w3": [
    228,
    878,
    15,
    40,
    7,
    37
   ],
   "witch_2_S_w4": [
    244,
    878,
    14,
    40,
    7,
    37
   ],
   "witch_2_S_w5": [
    259,
    878,
    15,
    40,
    8,
    37
   ],
   "witch_2_S_w7": [
    275,
    878,
    15,
    40,
    8,
    37
   ],
   "elder_3_E_w0": [
    291,
    878,
    22,
    39,
    11,
    35
   ],
   "elder_3_E_w3": [
    314,
    878,
    20,
    39,
    11,
    35
   ],
   "elder_3_E_w4": [
    335,
    878,
    21,
    39,
    11,
    35
   ],
   "elder_3_E_w5": [
    357,
    878,
    20,
    39,
    11,
    35
   ],
   "elder_3_E_w6": [
    378,
    878,
    21,
    39,
    11,
    35
   ],
   "elder_3_E_w7": [
    400,
    878,
    22,
    39,
    11,
    35
   ],
   "elder_3_NE_w0": [
    423,
    878,
    22,
    39,
    10,
    35
   ],
   "elder_3_NE_w4": [
    446,
    878,
    21,
    39,
    10,
    35
   ],
   "elder_3_NE_w5": [
    468,
    878,
    21,
    39,
    10,
    35
   ],
   "elder_3_NE_w7": [
    490,
    878,
    22,
    39,
    10,
    35
   ],
   "elder_3_N_i0": [
    513,
    878,
    16,
    39,
    8,
    36
   ],
   "elder_3_N_w4": [
    530,
    878,
    16,
    39,
    8,
    35
   ],
   "elder_3_SE_w3": [
    547,
    878,
    21,
    39,
    10,
    35
   ],
   "elder_3_SE_w7": [
    569,
    878,
    18,
    39,
    10,
    35
   ],
   "elder_3_S_w3": [
    588,
    878,
    17,
    39,
    8,
    35
   ],
   "elder_3_S_w7": [
    606,
    878,
    17,
    39,
    9,
    35
   ],
   "elf_3_NE_w0": [
    624,
    878,
    20,
    39,
    9,
    36
   ],
   "elf_3_N_w0": [
    645,
    878,
    14,
    39,
    7,
    36
   ],
   "elf_3_N_w2": [
    660,
    878,
    15,
    39,
    8,
    37
   ],
   "elf_3_N_w4": [
    676,
    878,
    14,
    39,
    7,
    36
   ],
   "elf_3_N_w6": [
    691,
    878,
    15,
    39,
    7,
    37
   ],
   "elf_3_S_w0": [
    707,
    878,
    14,
    39,
    7,
    35
   ],
   "elf_3_S_w4": [
    722,
    878,
    14,
    39,
    7,
    35
   ],
   "farmer_3_E_i1": [
    737,
    878,
    19,
    39,
    9,
    35
   ],
   "farmer_3_NE_w0": [
    757,
    878,
    22,
    39,
    9,
    36
   ],
   "farmer_3_NE_w6": [
    780,
    878,
    20,
    39,
    8,
    37
   ],
   "farmer_3_NE_w7": [
    801,
    878,
    21,
    39,
    8,
    36
   ],
   "farmer_3_N_w0": [
    823,
    878,
    20,
    39,
    10,
    36
   ],
   "farmer_3_N_w2": [
    844,
    878,
    19,
    39,
    10,
    37
   ],
   "farmer_3_N_w4": [
    864,
    878,
    20,
    39,
    10,
    36
   ],
   "farmer_3_N_w6": [
    885,
    878,
    19,
    39,
    9,
    37
   ],
   "farmer_3_S_i1": [
    905,
    878,
    20,
    39,
    10,
    35
   ],
   "farmer_3_S_w3": [
    926,
    878,
    19,
    39,
    9,
    35
   ],
   "farmer_3_S_w4": [
    946,
    878,
    20,
    39,
    10,
    35
   ],
   "farmer_3_S_w5": [
    967,
    878,
    19,
    39,
    10,
    35
   ],
   "guard_1_N_w4": [
    987,
    878,
    14,
    39,
    7,
    36
   ],
   "guard_1_N_w7": [
    1002,
    878,
    14,
    39,
    7,
    37
   ],
   "guard_2_NE_i1": [
    0,
    919,
    16,
    39,
    6,
    37
   ],
   "guard_2_NE_w1": [
    17,
    919,
    18,
    39,
    7,
    38
   ],
   "guard_2_NE_w2": [
    36,
    919,
    16,
    39,
    6,
    38
   ],
   "guard_2_NE_w4": [
    53,
    919,
    16,
    39,
    6,
    37
   ],
   "guard_2_NE_w5": [
    70,
    919,
    15,
    39,
    5,
    37
   ],
   "hooded_3_E_w0": [
    86,
    919,
    21,
    39,
    11,
    36
   ],
   "hooded_3_E_w1": [
    108,
    919,
    19,
    39,
    11,
    36
   ],
   "hooded_3_E_w2": [
    128,
    919,
    19,
    39,
    11,
    36
   ],
   "hooded_3_E_w3": [
    148,
    919,
    19,
    39,
    11,
    36
   ],
   "hooded_3_E_w4": [
    168,
    919,
    21,
    39,
    11,
    36
   ],
   "hooded_3_E_w5": [
    190,
    919,
    19,
    39,
    11,
    36
   ],
   "hooded_3_E_w6": [
    210,
    919,
    19,
    39,
    11,
    36
   ],
   "hooded_3_E_w7": [
    230,
    919,
    19,
    39,
    11,
    36
   ],
   "hooded_3_NE_w0": [
    250,
    919,
    21,
    39,
    10,
    36
   ],
   "hooded_3_NE_w1": [
    272,
    919,
    20,
    39,
    10,
    36
   ],
   "hooded_3_NE_w3": [
    293,
    919,
    18,
    39,
    10,
    36
   ],
   "hooded_3_NE_w4": [
    312,
    919,
    17,
    39,
    10,
    36
   ],
   "hooded_3_NE_w5": [
    330,
    919,
    18,
    39,
    10,
    36
   ],
   "hooded_3_NE_w7": [
    349,
    919,
    21,
    39,
    10,
    36
   ],
   "hooded_3_N_i0": [
    371,
    919,
    16,
    39,
    8,
    36
   ],
   "hooded_3_SE_w1": [
    388,
    919,
    18,
    39,
    10,
    36
   ],
   "hooded_3_SE_w2": [
    407,
    919,
    17,
    39,
    9,
    36
   ],
   "hooded_3_SE_w3": [
    425,
    919,
    21,
    39,
    10,
    36
   ],
   "hooded_3_SE_w4": [
    447,
    919,
    21,
    39,
    10,
    35
   ],
   "hooded_3_SE_w5": [
    469,
    919,
    20,
    39,
    10,
    36
   ],
   "hooded_3_SE_w6": [
    490,
    919,
    18,
    39,
    10,
    36
   ],
   "hooded_3_SE_w7": [
    509,
    919,
    18,
    39,
    10,
    36
   ],
   "hooded_3_S_w0": [
    528,
    919,
    16,
    39,
    8,
    35
   ],
   "hooded_3_S_w2": [
    545,
    919,
    16,
    39,
    8,
    36
   ],
   "hooded_3_S_w4": [
    562,
    919,
    16,
    39,
    8,
    35
   ],
   "hooded_3_S_w6": [
    579,
    919,
    16,
    39,
    8,
    36
   ],
   "maid_3_N_w3": [
    596,
    919,
    17,
    39,
    9,
    36
   ],
   "maid_3_N_w7": [
    614,
    919,
    17,
    39,
    8,
    36
   ],
   "monk_3_E_w1": [
    632,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_E_w2": [
    649,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_E_w3": [
    666,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_E_w6": [
    683,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_NE_w0": [
    700,
    919,
    19,
    39,
    8,
    35
   ],
   "monk_3_NE_w1": [
    720,
    919,
    18,
    39,
    8,
    35
   ],
   "monk_3_NE_w2": [
    739,
    919,
    17,
    39,
    9,
    35
   ],
   "monk_3_NE_w3": [
    757,
    919,
    17,
    39,
    9,
    35
   ],
   "monk_3_NE_w4": [
    775,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_NE_w5": [
    792,
    919,
    15,
    39,
    8,
    35
   ],
   "monk_3_NE_w6": [
    808,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_NE_w7": [
    825,
    919,
    19,
    39,
    8,
    35
   ],
   "monk_3_N_w0": [
    845,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_N_w1": [
    862,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_N_w2": [
    879,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_N_w3": [
    896,
    919,
    17,
    39,
    9,
    35
   ],
   "monk_3_N_w4": [
    914,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_N_w5": [
    931,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_N_w6": [
    948,
    919,
    16,
    39,
    8,
    35
   ],
   "monk_3_N_w7": [
    965,
    919,
    17,
    39,
    8,
    35
   ],
   "noble_3_E_w0": [
    983,
    919,
    18,
    39,
    8,
    35
   ],
   "noble_3_E_w1": [
    1002,
    919,
    16,
    39,
    8,
    35
   ],
   "noble_3_E_w3": [
    0,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_E_w4": [
    17,
    959,
    18,
    39,
    8,
    35
   ],
   "noble_3_E_w5": [
    36,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_E_w6": [
    53,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_E_w7": [
    70,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_NE_i0": [
    87,
    959,
    14,
    39,
    6,
    36
   ],
   "noble_3_NE_w0": [
    102,
    959,
    19,
    39,
    8,
    35
   ],
   "noble_3_NE_w4": [
    122,
    959,
    15,
    39,
    8,
    35
   ],
   "noble_3_N_i0": [
    138,
    959,
    16,
    39,
    8,
    36
   ],
   "noble_3_SE_w0": [
    155,
    959,
    15,
    39,
    8,
    35
   ],
   "noble_3_SE_w1": [
    171,
    959,
    15,
    39,
    8,
    35
   ],
   "noble_3_SE_w2": [
    187,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_SE_w3": [
    204,
    959,
    18,
    39,
    8,
    35
   ],
   "noble_3_SE_w4": [
    223,
    959,
    19,
    39,
    8,
    35
   ],
   "noble_3_SE_w5": [
    243,
    959,
    18,
    39,
    8,
    35
   ],
   "noble_3_SE_w6": [
    262,
    959,
    15,
    39,
    8,
    35
   ],
   "noble_3_SE_w7": [
    278,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_S_w1": [
    295,
    959,
    15,
    39,
    7,
    35
   ],
   "noble_3_S_w2": [
    311,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_S_w3": [
    328,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_S_w5": [
    345,
    959,
    15,
    39,
    8,
    35
   ],
   "noble_3_S_w6": [
    361,
    959,
    16,
    39,
    8,
    35
   ],
   "noble_3_S_w7": [
    378,
    959,
    16,
    39,
    8,
    35
   ],
   "orc_3_E_w2": [
    395,
    959,
    16,
    39,
    8,
    38
   ],
   "orc_3_E_w3": [
    412,
    959,
    18,
    39,
    8,
    38
   ],
   "orc_3_N_i1": [
    431,
    959,
    22,
    39,
    11,
    37
   ],
   "orc_3_SE_w7": [
    454,
    959,
    19,
    39,
    10,
    37
   ],
   "orc_3_S_w3": [
    474,
    959,
    21,
    39,
    11,
    37
   ],
   "orc_3_S_w7": [
    496,
    959,
    21,
    39,
    11,
    37
   ],
   "peasant_3_NE_w7": [
    518,
    959,
    18,
    39,
    7,
    36
   ],
   "peasant_3_N_w3": [
    537,
    959,
    16,
    39,
    8,
    36
   ],
   "peasant_3_N_w7": [
    554,
    959,
    16,
    39,
    8,
    36
   ],
   "peasant_3_SE_w4": [
    571,
    959,
    19,
    39,
    8,
    35
   ],
   "witch_2_E_i0": [
    591,
    959,
    17,
    39,
    9,
    37
   ],
   "witch_2_NE_i0": [
    609,
    959,
    18,
    39,
    8,
    37
   ],
   "witch_2_N_i0": [
    628,
    959,
    16,
    39,
    8,
    37
   ],
   "witch_2_SE_i1": [
    645,
    959,
    16,
    39,
    8,
    37
   ],
   "witch_2_S_i1": [
    662,
    959,
    16,
    39,
    8,
    37
   ],
   "dwarf_4_N_w0": [
    679,
    959,
    23,
    38,
    11,
    34
   ],
   "dwarf_4_N_w4": [
    703,
    959,
    23,
    38,
    11,
    34
   ],
   "elder_3_E_i0": [
    727,
    959,
    19,
    38,
    10,
    35
   ],
   "elder_3_E_w1": [
    747,
    959,
    22,
    38,
    11,
    35
   ],
   "elder_3_E_w2": [
    770,
    959,
    21,
    38,
    11,
    35
   ],
   "elder_3_NE_i0": [
    792,
    959,
    20,
    38,
    9,
    35
   ],
   "elder_3_N_i1": [
    813,
    959,
    16,
    38,
    8,
    35
   ],
   "elder_3_SE_i0": [
    830,
    959,
    17,
    38,
    9,
    35
   ],
   "elder_3_SE_w0": [
    848,
    959,
    18,
    38,
    10,
    34
   ],
   "elder_3_SE_w1": [
    867,
    959,
    17,
    38,
    10,
    35
   ],
   "elder_3_SE_w2": [
    885,
    959,
    17,
    38,
    9,
    35
   ],
   "elder_3_SE_w4": [
    903,
    959,
    21,
    38,
    10,
    34
   ],
   "elder_3_SE_w5": [
    925,
    959,
    20,
    38,
    10,
    35
   ],
   "elder_3_SE_w6": [
    946,
    959,
    18,
    38,
    10,
    35
   ],
   "elder_3_S_i0": [
    965,
    959,
    16,
    38,
    8,
    35
   ],
   "elder_3_S_w0": [
    982,
    959,
    16,
    38,
    8,
    34
   ],
   "elder_3_S_w1": [
    999,
    959,
    16,
    38,
    8,
    35
   ],
   "elder_3_S_w2": [
    0,
    999,
    16,
    38,
    8,
    35
   ],
   "elder_3_S_w4": [
    17,
    999,
    16,
    38,
    8,
    34
   ],
   "elder_3_S_w5": [
    34,
    999,
    16,
    38,
    8,
    35
   ],
   "elder_3_S_w6": [
    51,
    999,
    16,
    38,
    8,
    35
   ],
   "elf_3_E_i0": [
    68,
    999,
    15,
    38,
    9,
    36
   ],
   "elf_3_E_w0": [
    84,
    999,
    21,
    38,
    11,
    36
   ],
   "elf_3_E_w4": [
    106,
    999,
    21,
    38,
    11,
    36
   ],
   "elf_3_E_w5": [
    128,
    999,
    20,
    38,
    11,
    36
   ],
   "elf_3_E_w6": [
    149,
    999,
    17,
    38,
    10,
    36
   ],
   "elf_3_E_w7": [
    167,
    999,
    20,
    38,
    11,
    36
   ],
   "elf_3_NE_i0": [
    188,
    999,
    16,
    38,
    8,
    36
   ],
   "elf_3_NE_w3": [
    205,
    999,
    17,
    38,
    10,
    36
   ],
   "elf_3_NE_w4": [
    223,
    999,
    16,
    38,
    9,
    36
   ],
   "elf_3_NE_w6": [
    240,
    999,
    17,
    38,
    9,
    36
   ],
   "elf_3_NE_w7": [
    258,
    999,
    19,
    38,
    9,
    36
   ],
   "elf_3_N_i0": [
    278,
    999,
    16,
    38,
    8,
    36
   ],
   "elf_3_N_w3": [
    295,
    999,
    14,
    38,
    7,
    36
   ],
   "elf_3_N_w7": [
    310,
    999,
    14,
    38,
    7,
    36
   ],
   "elf_3_SE_i0": [
    325,
    999,
    16,
    38,
    8,
    36
   ],
   "elf_3_SE_w0": [
    342,
    999,
    16,
    38,
    9,
    35
   ],
   "elf_3_SE_w2": [
    359,
    999,
    17,
    38,
    9,
    36
   ],
   "elf_3_SE_w4": [
    377,
    999,
    20,
    38,
    9,
    35
   ],
   "elf_3_SE_w5": [
    398,
    999,
    20,
    38,
    10,
    35
   ],
   "elf_3_SE_w6": [
    419,
    999,
    16,
    38,
    9,
    36
   ],
   "elf_3_S_i0": [
    436,
    999,
    16,
    38,
    8,
    36
   ],
   "elf_3_S_w1": [
    453,
    999,
    14,
    38,
    7,
    35
   ],
   "elf_3_S_w5": [
    468,
    999,
    14,
    38,
    7,
    35
   ],
   "farmer_3_NE_i0": [
    483,
    999,
    21,
    38,
    9,
    36
   ],
   "farmer_3_NE_w2": [
    505,
    999,
    21,
    38,
    9,
    37
   ],
   "farmer_3_NE_w3": [
    527,
    999,
    21,
    38,
    9,
    36
   ],
   "farmer_3_NE_w4": [
    549,
    999,
    21,
    38,
    9,
    36
   ],
   "farmer_3_NE_w5": [
    571,
    999,
    20,
    38,
    8,
    36
   ],
   "farmer_3_N_i0": [
    592,
    999,
    20,
    38,
    10,
    36
   ],
   "farmer_3_N_w1": [
    613,
    999,
    19,
    38,
    10,
    37
   ],
   "farmer_3_N_w5": [
    633,
    999,
    19,
    38,
    9,
    37
   ],
   "guard_1_N_i0": [
    653,
    999,
    14,
    38,
    7,
    36
   ],
   "guard_1_N_w1": [
    668,
    999,
    14,
    38,
    7,
    37
   ],
   "guard_1_N_w2": [
    683,
    999,
    14,
    38,
    7,
    36
   ],
   "guard_1_N_w3": [
    698,
    999,
    14,
    38,
    7,
    36
   ],
   "guard_1_N_w6": [
    713,
    999,
    14,
    38,
    7,
    36
   ],
   "guard_2_E_i0": [
    728,
    999,
    14,
    38,
    6,
    36
   ],
   "guard_2_E_w0": [
    743,
    999,
    16,
    38,
    6,
    36
   ],
   "guard_2_E_w6": [
    760,
    999,
    15,
    38,
    6,
    36
   ],
   "guard_2_E_w7": [
    776,
    999,
    15,
    38,
    6,
    36
   ],
   "guard_2_S_w1": [
    792,
    999,
    16,
    38,
    8,
    35
   ],
   "guard_2_S_w4": [
    809,
    999,
    16,
    38,
    8,
    35
   ],
   "guard_2_S_w5": [
    826,
    999,
    16,
    38,
    8,
    35
   ],
   "hooded_3_E_i0": [
    843,
    999,
    17,
    38,
    10,
    36
   ],
   "hooded_3_NE_i0": [
    861,
    999,
    17,
    38,
    9,
    36
   ],
   "hooded_3_N_i1": [
    879,
    999,
    16,
    38,
    8,
    35
   ],
   "hooded_3_SE_i0": [
    896,
    999,
    17,
    38,
    9,
    36
   ],
   "hooded_3_SE_w0": [
    914,
    999,
    18,
    38,
    10,
    35
   ],
   "hooded_3_S_i0": [
    933,
    999,
    16,
    38,
    8,
    36
   ],
   "hooded_3_S_w1": [
    950,
    999,
    16,
    38,
    8,
    35
   ],
   "hooded_3_S_w3": [
    967,
    999,
    17,
    38,
    8,
    35
   ],
   "hooded_3_S_w5": [
    985,
    999,
    16,
    38,
    8,
    35
   ],
   "hooded_3_S_w7": [
    1002,
    999,
    17,
    38,
    9,
    35
   ],
   "maid_3_NE_w0": [
    0,
    1038,
    19,
    38,
    8,
    35
   ],
   "maid_3_NE_w1": [
    20,
    1038,
    18,
    38,
    8,
    36
   ],
   "maid_3_NE_w2": [
    39,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_NE_w3": [
    56,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_NE_w6": [
    73,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_NE_w7": [
    90,
    1038,
    19,
    38,
    8,
    35
   ],
   "maid_3_N_i0": [
    110,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_N_w0": [
    127,
    1038,
    16,
    38,
    8,
    35
   ],
   "maid_3_N_w1": [
    144,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_N_w2": [
    161,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_N_w4": [
    178,
    1038,
    16,
    38,
    8,
    35
   ],
   "maid_3_N_w5": [
    195,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_N_w6": [
    212,
    1038,
    16,
    38,
    8,
    36
   ],
   "maid_3_SE_w4": [
    229,
    1038,
    19,
    38,
    8,
    34
   ],
   "maid_3_SE_w5": [
    249,
    1038,
    18,
    38,
    8,
    35
   ],
   "maid_3_S_w0": [
    268,
    1038,
    16,
    38,
    8,
    34
   ],
   "maid_3_S_w1": [
    285,
    1038,
    16,
    38,
    8,
    35
   ],
   "maid_3_S_w4": [
    302,
    1038,
    16,
    38,
    8,
    34
   ],
   "maid_3_S_w5": [
    319,
    1038,
    16,
    38,
    8,
    35
   ],
   "monk_3_E_i0": [
    336,
    1038,
    12,
    38,
    6,
    35
   ],
   "monk_3_E_w0": [
    349,
    1038,
    18,
    38,
    8,
    34
   ],
   "monk_3_E_w4": [
    368,
    1038,
    18,
    38,
    8,
    34
   ],
   "monk_3_E_w5": [
    387,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_E_w7": [
    404,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_NE_i0": [
    421,
    1038,
    14,
    38,
    6,
    35
   ],
   "monk_3_N_i0": [
    436,
    1038,
    16,
    38,
    8,
    35
   ],
   "monk_3_SE_w0": [
    453,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_SE_w2": [
    470,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_SE_w3": [
    487,
    1038,
    19,
    38,
    8,
    34
   ],
   "monk_3_SE_w4": [
    507,
    1038,
    19,
    38,
    8,
    34
   ],
   "monk_3_SE_w5": [
    527,
    1038,
    18,
    38,
    8,
    34
   ],
   "monk_3_SE_w6": [
    546,
    1038,
    17,
    38,
    9,
    34
   ],
   "monk_3_SE_w7": [
    564,
    1038,
    17,
    38,
    9,
    34
   ],
   "monk_3_S_w0": [
    582,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_S_w2": [
    599,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_S_w3": [
    616,
    1038,
    17,
    38,
    8,
    34
   ],
   "monk_3_S_w4": [
    634,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_S_w6": [
    651,
    1038,
    16,
    38,
    8,
    34
   ],
   "monk_3_S_w7": [
    668,
    1038,
    17,
    38,
    9,
    34
   ],
   "noble_3_E_i0": [
    686,
    1038,
    12,
    38,
    6,
    35
   ],
   "noble_3_NE_i1": [
    699,
    1038,
    14,
    38,
    6,
    35
   ],
   "noble_3_N_i1": [
    714,
    1038,
    16,
    38,
    8,
    35
   ],
   "noble_3_SE_i0": [
    731,
    1038,
    14,
    38,
    6,
    35
   ],
   "noble_3_S_i0": [
    746,
    1038,
    16,
    38,
    8,
    35
   ],
   "noble_3_S_w0": [
    763,
    1038,
    14,
    38,
    7,
    34
   ],
   "noble_3_S_w4": [
    778,
    1038,
    14,
    38,
    7,
    34
   ],
   "peasant_3_NE_i0": [
    793,
    1038,
    14,
    38,
    6,
    36
   ],
   "peasant_3_NE_w0": [
    808,
    1038,
    19,
    38,
    8,
    35
   ],
   "peasant_3_NE_w3": [
    828,
    1038,
    13,
    38,
    5,
    36
   ],
   "peasant_3_NE_w5": [
    842,
    1038,
    13,
    38,
    6,
    36
   ],
   "peasant_3_NE_w6": [
    856,
    1038,
    13,
    38,
    5,
    36
   ],
   "peasant_3_N_i0": [
    870,
    1038,
    16,
    38,
    8,
    36
   ],
   "peasant_3_N_w0": [
    887,
    1038,
    16,
    38,
    8,
    35
   ],
   "peasant_3_N_w2": [
    904,
    1038,
    16,
    38,
    8,
    36
   ],
   "peasant_3_N_w4": [
    921,
    1038,
    16,
    38,
    8,
    35
   ],
   "peasant_3_N_w6": [
    938,
    1038,
    16,
    38,
    8,
    36
   ],
   "peasant_3_SE_w0": [
    955,
    1038,
    15,
    38,
    7,
    35
   ],
   "peasant_3_SE_w5": [
    971,
    1038,
    17,
    38,
    7,
    35
   ],
   "peasant_3_S_w0": [
    989,
    1038,
    16,
    38,
    8,
    34
   ],
   "peasant_3_S_w1": [
    1006,
    1038,
    16,
    38,
    8,
    35
   ],
   "peasant_3_S_w4": [
    0,
    1077,
    16,
    38,
    8,
    34
   ],
   "peasant_3_S_w5": [
    17,
    1077,
    16,
    38,
    8,
    35
   ],
   "witch_2_E_i1": [
    34,
    1077,
    17,
    38,
    9,
    36
   ],
   "witch_2_NE_i1": [
    52,
    1077,
    18,
    38,
    8,
    36
   ],
   "witch_2_N_i1": [
    71,
    1077,
    16,
    38,
    8,
    36
   ],
   "baker_2_S_i0": [
    88,
    1077,
    16,
    37,
    8,
    35
   ],
   "baker_2_S_t0": [
    105,
    1077,
    17,
    37,
    8,
    35
   ],
   "baker_2_S_t1": [
    123,
    1077,
    17,
    37,
    8,
    35
   ],
   "dwarf_4_E_i0": [
    141,
    1077,
    17,
    37,
    8,
    34
   ],
   "dwarf_4_NE_i0": [
    159,
    1077,
    20,
    37,
    9,
    34
   ],
   "dwarf_4_NE_w0": [
    180,
    1077,
    23,
    37,
    11,
    33
   ],
   "dwarf_4_NE_w6": [
    204,
    1077,
    19,
    37,
    8,
    34
   ],
   "dwarf_4_NE_w7": [
    224,
    1077,
    22,
    37,
    10,
    34
   ],
   "dwarf_4_N_w3": [
    247,
    1077,
    23,
    37,
    12,
    34
   ],
   "dwarf_4_N_w7": [
    271,
    1077,
    23,
    37,
    11,
    34
   ],
   "dwarf_4_SE_i0": [
    295,
    1077,
    22,
    37,
    12,
    34
   ],
   "dwarf_4_SE_w4": [
    318,
    1077,
    25,
    37,
    12,
    33
   ],
   "dwarf_4_SE_w5": [
    344,
    1077,
    24,
    37,
    12,
    33
   ],
   "dwarf_4_S_i0": [
    369,
    1077,
    24,
    37,
    12,
    34
   ],
   "dwarf_4_S_w1": [
    394,
    1077,
    23,
    37,
    11,
    33
   ],
   "dwarf_4_S_w5": [
    418,
    1077,
    23,
    37,
    12,
    33
   ],
   "elder_2_N_w0": [
    442,
    1077,
    14,
    37,
    7,
    33
   ],
   "elder_2_N_w7": [
    457,
    1077,
    15,
    37,
    7,
    33
   ],
   "elder_3_E_i1": [
    473,
    1077,
    19,
    37,
    10,
    34
   ],
   "elder_3_NE_i1": [
    493,
    1077,
    20,
    37,
    9,
    34
   ],
   "elder_3_SE_i1": [
    514,
    1077,
    17,
    37,
    9,
    34
   ],
   "elder_3_S_i1": [
    532,
    1077,
    16,
    37,
    8,
    34
   ],
   "elf_3_E_i1": [
    549,
    1077,
    15,
    37,
    9,
    35
   ],
   "elf_3_E_w1": [
    565,
    1077,
    20,
    37,
    11,
    36
   ],
   "elf_3_E_w2": [
    586,
    1077,
    17,
    37,
    10,
    36
   ],
   "elf_3_E_w3": [
    604,
    1077,
    20,
    37,
    11,
    36
   ],
   "elf_3_NE_i1": [
    625,
    1077,
    16,
    37,
    8,
    35
   ],
   "elf_3_NE_w1": [
    642,
    1077,
    20,
    37,
    10,
    36
   ],
   "elf_3_NE_w2": [
    663,
    1077,
    16,
    37,
    9,
    36
   ],
   "elf_3_NE_w5": [
    680,
    1077,
    15,
    37,
    9,
    36
   ],
   "elf_3_N_i1": [
    696,
    1077,
    16,
    37,
    8,
    35
   ],
   "elf_3_N_w1": [
    713,
    1077,
    14,
    37,
    7,
    36
   ],
   "elf_3_N_w5": [
    728,
    1077,
    14,
    37,
    7,
    36
   ],
   "elf_3_SE_i1": [
    743,
    1077,
    16,
    37,
    8,
    35
   ],
   "elf_3_SE_w1": [
    760,
    1077,
    15,
    37,
    9,
    35
   ],
   "elf_3_SE_w3": [
    776,
    1077,
    19,
    37,
    9,
    35
   ],
   "elf_3_SE_w7": [
    796,
    1077,
    17,
    37,
    10,
    35
   ],
   "elf_3_S_i1": [
    814,
    1077,
    16,
    37,
    8,
    35
   ],
   "elf_3_S_w2": [
    831,
    1077,
    15,
    37,
    7,
    35
   ],
   "elf_3_S_w3": [
    847,
    1077,
    14,
    37,
    7,
    35
   ],
   "elf_3_S_w6": [
    862,
    1077,
    15,
    37,
    8,
    35
   ],
   "elf_3_S_w7": [
    878,
    1077,
    14,
    37,
    7,
    35
   ],
   "farmer_2_SE_i0": [
    893,
    1077,
    17,
    37,
    8,
    32
   ],
   "farmer_2_SE_w1": [
    911,
    1077,
    18,
    37,
    8,
    32
   ],
   "farmer_2_SE_w2": [
    930,
    1077,
    18,
    37,
    8,
    32
   ],
   "farmer_2_SE_w5": [
    949,
    1077,
    17,
    37,
    8,
    32
   ],
   "farmer_2_SE_w6": [
    967,
    1077,
    17,
    37,
    8,
    32
   ],
   "farmer_2_SE_w7": [
    985,
    1077,
    17,
    37,
    8,
    32
   ],
   "farmer_3_NE_i1": [
    1003,
    1077,
    21,
    37,
    9,
    35
   ],
   "farmer_3_NE_w1": [
    0,
    1116,
    21,
    37,
    9,
    36
   ],
   "farmer_3_N_i1": [
    22,
    1116,
    20,
    37,
    10,
    35
   ],
   "guard_1_NE_w0": [
    43,
    1116,
    17,
    37,
    7,
    34
   ],
   "guard_1_N_i1": [
    61,
    1116,
    14,
    37,
    7,
    35
   ],
   "guard_1_N_w5": [
    76,
    1116,
    14,
    37,
    7,
    36
   ],
   "guard_2_E_i1": [
    91,
    1116,
    14,
    37,
    6,
    35
   ],
   "guard_2_E_w1": [
    106,
    1116,
    15,
    37,
    6,
    36
   ],
   "guard_2_E_w2": [
    122,
    1116,
    15,
    37,
    6,
    36
   ],
   "guard_2_E_w4": [
    138,
    1116,
    15,
    37,
    6,
    35
   ],
   "guard_2_E_w5": [
    154,
    1116,
    14,
    37,
    6,
    35
   ],
   "guard_2_SE_i0": [
    169,
    1116,
    13,
    37,
    6,
    35
   ],
   "guard_2_SE_w2": [
    183,
    1116,
    13,
    37,
    6,
    35
   ],
   "guard_2_SE_w4": [
    197,
    1116,
    16,
    37,
    6,
    34
   ],
   "guard_2_SE_w5": [
    214,
    1116,
    15,
    37,
    6,
    34
   ],
   "guard_2_S_i0": [
    230,
    1116,
    16,
    37,
    8,
    35
   ],
   "guard_2_S_w0": [
    247,
    1116,
    16,
    37,
    8,
    34
   ],
   "guard_2_S_w2": [
    264,
    1116,
    16,
    37,
    8,
    35
   ],
   "guard_2_S_w3": [
    281,
    1116,
    16,
    37,
    8,
    35
   ],
   "guard_2_S_w6": [
    298,
    1116,
    16,
    37,
    8,
    35
   ],
   "guard_2_S_w7": [
    315,
    1116,
    16,
    37,
    8,
    35
   ],
   "hooded_3_E_i1": [
    332,
    1116,
    17,
    37,
    10,
    35
   ],
   "hooded_3_NE_i1": [
    350,
    1116,
    17,
    37,
    9,
    35
   ],
   "hooded_3_SE_i1": [
    368,
    1116,
    17,
    37,
    9,
    35
   ],
   "hooded_3_S_i1": [
    386,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_E_i0": [
    403,
    1116,
    13,
    37,
    7,
    35
   ],
   "maid_3_E_w0": [
    417,
    1116,
    18,
    37,
    8,
    35
   ],
   "maid_3_E_w3": [
    436,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_E_w4": [
    453,
    1116,
    18,
    37,
    8,
    35
   ],
   "maid_3_E_w5": [
    472,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_E_w6": [
    489,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_E_w7": [
    506,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_NE_i0": [
    523,
    1116,
    14,
    37,
    6,
    35
   ],
   "maid_3_NE_w4": [
    538,
    1116,
    15,
    37,
    8,
    35
   ],
   "maid_3_NE_w5": [
    554,
    1116,
    15,
    37,
    8,
    35
   ],
   "maid_3_N_i1": [
    570,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_SE_i0": [
    587,
    1116,
    14,
    37,
    6,
    35
   ],
   "maid_3_SE_w0": [
    602,
    1116,
    16,
    37,
    8,
    34
   ],
   "maid_3_SE_w1": [
    619,
    1116,
    15,
    37,
    8,
    35
   ],
   "maid_3_SE_w2": [
    635,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_SE_w3": [
    652,
    1116,
    19,
    37,
    8,
    35
   ],
   "maid_3_SE_w6": [
    672,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_SE_w7": [
    689,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_S_i0": [
    706,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_S_w2": [
    723,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_S_w3": [
    740,
    1116,
    17,
    37,
    8,
    35
   ],
   "maid_3_S_w6": [
    758,
    1116,
    16,
    37,
    8,
    35
   ],
   "maid_3_S_w7": [
    775,
    1116,
    17,
    37,
    9,
    35
   ],
   "merchant_3_E_i0": [
    793,
    1116,
    14,
    37,
    7,
    35
   ],
   "merchant_3_E_t0": [
    808,
    1116,
    16,
    37,
    7,
    35
   ],
   "merchant_3_E_t1": [
    825,
    1116,
    16,
    37,
    7,
    35
   ],
   "monk_3_E_i1": [
    842,
    1116,
    12,
    37,
    6,
    34
   ],
   "monk_3_NE_i1": [
    855,
    1116,
    14,
    37,
    6,
    34
   ],
   "monk_3_N_i1": [
    870,
    1116,
    16,
    37,
    8,
    34
   ],
   "monk_3_SE_i0": [
    887,
    1116,
    14,
    37,
    6,
    34
   ],
   "monk_3_SE_w1": [
    902,
    1116,
    15,
    37,
    8,
    34
   ],
   "monk_3_S_i0": [
    918,
    1116,
    16,
    37,
    8,
    34
   ],
   "monk_3_S_w1": [
    935,
    1116,
    16,
    37,
    8,
    34
   ],
   "monk_3_S_w5": [
    952,
    1116,
    16,
    37,
    8,
    34
   ],
   "noble_3_E_i1": [
    969,
    1116,
    12,
    37,
    6,
    34
   ],
   "noble_3_SE_i1": [
    982,
    1116,
    14,
    37,
    6,
    34
   ],
   "noble_3_S_i1": [
    997,
    1116,
    16,
    37,
    8,
    34
   ],
   "orc_2_E_i0": [
    0,
    1154,
    13,
    37,
    7,
    34
   ],
   "orc_2_E_w5": [
    14,
    1154,
    16,
    37,
    7,
    34
   ],
   "orc_2_E_w6": [
    31,
    1154,
    14,
    37,
    7,
    34
   ],
   "orc_2_E_w7": [
    46,
    1154,
    15,
    37,
    7,
    34
   ],
   "orc_2_NE_w0": [
    62,
    1154,
    19,
    37,
    9,
    34
   ],
   "orc_2_NE_w7": [
    82,
    1154,
    18,
    37,
    8,
    34
   ],
   "orc_2_N_w0": [
    101,
    1154,
    19,
    37,
    9,
    34
   ],
   "orc_2_N_w3": [
    121,
    1154,
    19,
    37,
    9,
    34
   ],
   "orc_2_N_w4": [
    141,
    1154,
    19,
    37,
    9,
    34
   ],
   "orc_2_N_w7": [
    161,
    1154,
    19,
    37,
    9,
    34
   ],
   "orc_2_SE_i0": [
    181,
    1154,
    18,
    37,
    9,
    34
   ],
   "orc_2_SE_w4": [
    200,
    1154,
    21,
    37,
    9,
    33
   ],
   "orc_2_S_w0": [
    222,
    1154,
    19,
    37,
    10,
    33
   ],
   "orc_2_S_w4": [
    242,
    1154,
    19,
    37,
    10,
    33
   ],
   "peasant_3_E_i0": [
    262,
    1154,
    12,
    37,
    5,
    35
   ],
   "peasant_3_E_w0": [
    275,
    1154,
    17,
    37,
    7,
    35
   ],
   "peasant_3_E_w2": [
    293,
    1154,
    11,
    37,
    4,
    36
   ],
   "peasant_3_E_w4": [
    305,
    1154,
    17,
    37,
    7,
    35
   ],
   "peasant_3_E_w5": [
    323,
    1154,
    14,
    37,
    6,
    35
   ],
   "peasant_3_E_w6": [
    338,
    1154,
    11,
    37,
    4,
    35
   ],
   "peasant_3_E_w7": [
    350,
    1154,
    13,
    37,
    5,
    35
   ],
   "peasant_3_NE_i1": [
    364,
    1154,
    14,
    37,
    6,
    35
   ],
   "peasant_3_NE_w1": [
    379,
    1154,
    17,
    37,
    7,
    36
   ],
   "peasant_3_NE_w2": [
    397,
    1154,
    13,
    37,
    6,
    36
   ],
   "peasant_3_NE_w4": [
    411,
    1154,
    14,
    37,
    7,
    35
   ],
   "peasant_3_N_i1": [
    426,
    1154,
    16,
    37,
    8,
    35
   ],
   "peasant_3_N_w1": [
    443,
    1154,
    16,
    37,
    8,
    36
   ],
   "peasant_3_N_w5": [
    460,
    1154,
    16,
    37,
    8,
    36
   ],
   "peasant_3_SE_i0": [
    477,
    1154,
    14,
    37,
    6,
    35
   ],
   "peasant_3_SE_w1": [
    492,
    1154,
    13,
    37,
    6,
    35
   ],
   "peasant_3_SE_w2": [
    506,
    1154,
    14,
    37,
    6,
    35
   ],
   "peasant_3_SE_w3": [
    521,
    1154,
    18,
    37,
    7,
    35
   ],
   "peasant_3_SE_w6": [
    540,
    1154,
    14,
    37,
    6,
    35
   ],
   "peasant_3_SE_w7": [
    555,
    1154,
    13,
    37,
    5,
    35
   ],
   "peasant_3_S_i0": [
    569,
    1154,
    16,
    37,
    8,
    35
   ],
   "peasant_3_S_w2": [
    586,
    1154,
    15,
    37,
    7,
    35
   ],
   "peasant_3_S_w3": [
    602,
    1154,
    16,
    37,
    8,
    35
   ],
   "peasant_3_S_w6": [
    619,
    1154,
    15,
    37,
    8,
    35
   ],
   "peasant_3_S_w7": [
    635,
    1154,
    16,
    37,
    8,
    35
   ],
   "baker_2_S_i1": [
    652,
    1154,
    16,
    36,
    8,
    34
   ],
   "dwarf_4_E_i1": [
    669,
    1154,
    17,
    36,
    8,
    33
   ],
   "dwarf_4_E_w0": [
    687,
    1154,
    18,
    36,
    8,
    33
   ],
   "dwarf_4_E_w4": [
    706,
    1154,
    18,
    36,
    8,
    33
   ],
   "dwarf_4_E_w5": [
    725,
    1154,
    17,
    36,
    7,
    33
   ],
   "dwarf_4_E_w6": [
    743,
    1154,
    17,
    36,
    7,
    33
   ],
   "dwarf_4_E_w7": [
    761,
    1154,
    17,
    36,
    7,
    33
   ],
   "dwarf_4_NE_i1": [
    779,
    1154,
    20,
    36,
    9,
    33
   ],
   "dwarf_4_NE_w1": [
    800,
    1154,
    21,
    36,
    10,
    34
   ],
   "dwarf_4_NE_w3": [
    822,
    1154,
    18,
    36,
    8,
    34
   ],
   "dwarf_4_NE_w4": [
    841,
    1154,
    18,
    36,
    8,
    33
   ],
   "dwarf_4_NE_w5": [
    860,
    1154,
    19,
    36,
    8,
    34
   ],
   "dwarf_4_N_i0": [
    880,
    1154,
    23,
    36,
    11,
    34
   ],
   "dwarf_4_N_w1": [
    904,
    1154,
    23,
    36,
    12,
    34
   ],
   "dwarf_4_N_w2": [
    928,
    1154,
    23,
    36,
    12,
    34
   ],
   "dwarf_4_N_w5": [
    952,
    1154,
    23,
    36,
    11,
    34
   ],
   "dwarf_4_N_w6": [
    976,
    1154,
    23,
    36,
    11,
    34
   ],
   "dwarf_4_SE_i1": [
    1000,
    1154,
    22,
    36,
    12,
    33
   ],
   "dwarf_4_SE_w0": [
    0,
    1192,
    21,
    36,
    11,
    33
   ],
   "dwarf_4_SE_w3": [
    22,
    1192,
    25,
    36,
    12,
    33
   ],
   "dwarf_4_SE_w6": [
    48,
    1192,
    22,
    36,
    12,
    33
   ],
   "dwarf_4_SE_w7": [
    71,
    1192,
    20,
    36,
    11,
    33
   ],
   "dwarf_4_S_i1": [
    92,
    1192,
    24,
    36,
    12,
    33
   ],
   "dwarf_4_S_w0": [
    117,
    1192,
    23,
    36,
    12,
    32
   ],
   "dwarf_4_S_w2": [
    141,
    1192,
    23,
    36,
    11,
    33
   ],
   "dwarf_4_S_w3": [
    165,
    1192,
    23,
    36,
    11,
    33
   ],
   "dwarf_4_S_w4": [
    189,
    1192,
    23,
    36,
    12,
    32
   ],
   "dwarf_4_S_w6": [
    213,
    1192,
    23,
    36,
    12,
    33
   ],
   "dwarf_4_S_w7": [
    237,
    1192,
    23,
    36,
    12,
    33
   ],
   "elder_2_N_w1": [
    261,
    1192,
    14,
    36,
    7,
    33
   ],
   "elder_2_N_w3": [
    276,
    1192,
    15,
    36,
    8,
    32
   ],
   "farmer_2_SE_i1": [
    292,
    1192,
    17,
    36,
    8,
    31
   ],
   "farmer_2_SE_w0": [
    310,
    1192,
    18,
    36,
    8,
    31
   ],
   "farmer_2_SE_w3": [
    329,
    1192,
    18,
    36,
    8,
    32
   ],
   "farmer_2_S_i0": [
    348,
    1192,
    18,
    36,
    9,
    32
   ],
   "farmer_2_S_w1": [
    367,
    1192,
    17,
    36,
    8,
    32
   ],
   "farmer_2_S_w2": [
    385,
    1192,
    17,
    36,
    8,
    32
   ],
   "farmer_2_S_w3": [
    403,
    1192,
    17,
    36,
    8,
    32
   ],
   "farmer_2_S_w5": [
    421,
    1192,
    17,
    36,
    9,
    32
   ],
   "farmer_2_S_w6": [
    439,
    1192,
    17,
    36,
    9,
    32
   ],
   "farmer_2_S_w7": [
    457,
    1192,
    17,
    36,
    9,
    32
   ],
   "guard_1_NE_i0": [
    475,
    1192,
    15,
    36,
    6,
    34
   ],
   "guard_1_NE_w1": [
    491,
    1192,
    16,
    36,
    6,
    35
   ],
   "guard_1_NE_w3": [
    508,
    1192,
    14,
    36,
    5,
    34
   ],
   "guard_1_NE_w4": [
    523,
    1192,
    14,
    36,
    5,
    34
   ],
   "guard_1_NE_w6": [
    538,
    1192,
    15,
    36,
    5,
    34
   ],
   "guard_1_NE_w7": [
    554,
    1192,
    16,
    36,
    6,
    34
   ],
   "guard_2_E_w3": [
    571,
    1192,
    14,
    36,
    6,
    35
   ],
   "guard_2_SE_i1": [
    586,
    1192,
    13,
    36,
    6,
    34
   ],
   "guard_2_SE_w0": [
    600,
    1192,
    13,
    36,
    6,
    34
   ],
   "guard_2_SE_w1": [
    614,
    1192,
    12,
    36,
    5,
    34
   ],
   "guard_2_SE_w3": [
    627,
    1192,
    15,
    36,
    6,
    34
   ],
   "guard_2_SE_w6": [
    643,
    1192,
    13,
    36,
    6,
    34
   ],
   "guard_2_SE_w7": [
    657,
    1192,
    13,
    36,
    6,
    34
   ],
   "guard_2_S_i1": [
    671,
    1192,
    16,
    36,
    8,
    34
   ],
   "hooded_2_NE_w2": [
    688,
    1192,
    16,
    36,
    9,
    33
   ],
   "hooded_2_N_w2": [
    705,
    1192,
    15,
    36,
    8,
    33
   ],
   "hooded_2_N_w6": [
    721,
    1192,
    15,
    36,
    7,
    33
   ],
   "maid_3_E_i1": [
    737,
    1192,
    14,
    36,
    8,
    34
   ],
   "maid_3_E_w1": [
    752,
    1192,
    16,
    36,
    8,
    35
   ],
   "maid_3_E_w2": [
    769,
    1192,
    16,
    36,
    8,
    35
   ],
   "maid_3_NE_i1": [
    786,
    1192,
    14,
    36,
    6,
    34
   ],
   "maid_3_SE_i1": [
    801,
    1192,
    14,
    36,
    6,
    34
   ],
   "maid_3_S_i1": [
    816,
    1192,
    16,
    36,
    8,
    34
   ],
   "merchant_3_E_i1": [
    833,
    1192,
    14,
    36,
    7,
    34
   ],
   "monk_3_SE_i1": [
    848,
    1192,
    14,
    36,
    6,
    33
   ],
   "monk_3_S_i1": [
    863,
    1192,
    16,
    36,
    8,
    33
   ],
   "noble_2_E_w2": [
    880,
    1192,
    14,
    36,
    7,
    32
   ],
   "noble_2_NE_w0": [
    895,
    1192,
    17,
    36,
    7,
    32
   ],
   "noble_2_NE_w1": [
    913,
    1192,
    16,
    36,
    7,
    32
   ],
   "noble_2_NE_w2": [
    930,
    1192,
    15,
    36,
    8,
    32
   ],
   "noble_2_NE_w3": [
    946,
    1192,
    14,
    36,
    7,
    32
   ],
   "noble_2_NE_w4": [
    961,
    1192,
    14,
    36,
    7,
    32
   ],
   "noble_2_NE_w5": [
    976,
    1192,
    13,
    36,
    7,
    32
   ],
   "noble_2_NE_w6": [
    990,
    1192,
    14,
    36,
    7,
    32
   ],
   "noble_2_NE_w7": [
    1005,
    1192,
    16,
    36,
    7,
    32
   ],
   "noble_2_N_w0": [
    0,
    1229,
    14,
    36,
    7,
    32
   ],
   "noble_2_N_w1": [
    15,
    1229,
    13,
    36,
    7,
    32
   ],
   "noble_2_N_w2": [
    29,
    1229,
    14,
    36,
    7,
    32
   ],
   "noble_2_N_w3": [
    44,
    1229,
    15,
    36,
    8,
    32
   ],
   "noble_2_N_w4": [
    60,
    1229,
    14,
    36,
    7,
    32
   ],
   "noble_2_N_w5": [
    75,
    1229,
    13,
    36,
    6,
    32
   ],
   "noble_2_N_w6": [
    89,
    1229,
    14,
    36,
    7,
    32
   ],
   "noble_2_N_w7": [
    104,
    1229,
    15,
    36,
    7,
    32
   ],
   "orc_2_E_i1": [
    120,
    1229,
    13,
    36,
    7,
    33
   ],
   "orc_2_E_w0": [
    134,
    1229,
    15,
    36,
    7,
    33
   ],
   "orc_2_E_w1": [
    150,
    1229,
    14,
    36,
    7,
    34
   ],
   "orc_2_E_w4": [
    165,
    1229,
    17,
    36,
    7,
    33
   ],
   "orc_2_NE_i0": [
    183,
    1229,
    17,
    36,
    7,
    34
   ],
   "orc_2_NE_w1": [
    201,
    1229,
    18,
    36,
    8,
    34
   ],
   "orc_2_NE_w3": [
    220,
    1229,
    16,
    36,
    7,
    34
   ],
   "orc_2_NE_w4": [
    237,
    1229,
    16,
    36,
    7,
    34
   ],
   "orc_2_NE_w5": [
    254,
    1229,
    16,
    36,
    6,
    34
   ],
   "orc_2_NE_w6": [
    271,
    1229,
    17,
    36,
    7,
    34
   ],
   "orc_2_N_i0": [
    289,
    1229,
    20,
    36,
    10,
    34
   ],
   "orc_2_N_w2": [
    310,
    1229,
    19,
    36,
    10,
    34
   ],
   "orc_2_N_w6": [
    330,
    1229,
    19,
    36,
    9,
    34
   ],
   "orc_2_SE_i1": [
    350,
    1229,
    18,
    36,
    9,
    33
   ],
   "orc_2_SE_w0": [
    369,
    1229,
    16,
    36,
    8,
    33
   ],
   "orc_2_SE_w2": [
    386,
    1229,
    17,
    36,
    8,
    34
   ],
   "orc_2_SE_w5": [
    404,
    1229,
    20,
    36,
    9,
    33
   ],
   "orc_2_SE_w6": [
    425,
    1229,
    17,
    36,
    9,
    33
   ],
   "orc_2_S_w1": [
    443,
    1229,
    19,
    36,
    10,
    33
   ],
   "orc_2_S_w5": [
    463,
    1229,
    19,
    36,
    10,
    33
   ],
   "peasant_3_E_i1": [
    483,
    1229,
    12,
    36,
    5,
    34
   ],
   "peasant_3_E_w1": [
    496,
    1229,
    14,
    36,
    6,
    35
   ],
   "peasant_3_E_w3": [
    511,
    1229,
    13,
    36,
    5,
    35
   ],
   "peasant_3_SE_i1": [
    525,
    1229,
    14,
    36,
    6,
    34
   ],
   "peasant_3_S_i1": [
    540,
    1229,
    16,
    36,
    8,
    34
   ],
   "dwarf_4_E_w1": [
    557,
    1229,
    17,
    35,
    7,
    33
   ],
   "dwarf_4_E_w2": [
    575,
    1229,
    17,
    35,
    7,
    34
   ],
   "dwarf_4_E_w3": [
    593,
    1229,
    17,
    35,
    7,
    33
   ],
   "dwarf_4_NE_w2": [
    611,
    1229,
    20,
    35,
    9,
    34
   ],
   "dwarf_4_N_i1": [
    632,
    1229,
    24,
    35,
    12,
    33
   ],
   "dwarf_4_SE_w1": [
    657,
    1229,
    21,
    35,
    11,
    33
   ],
   "dwarf_4_SE_w2": [
    679,
    1229,
    21,
    35,
    11,
    33
   ],
   "elder_2_E_w2": [
    701,
    1229,
    19,
    35,
    10,
    32
   ],
   "elder_2_E_w7": [
    721,
    1229,
    20,
    35,
    10,
    31
   ],
   "elder_2_NE_i0": [
    742,
    1229,
    18,
    35,
    8,
    32
   ],
   "elder_2_NE_w0": [
    761,
    1229,
    20,
    35,
    9,
    31
   ],
   "elder_2_NE_w1": [
    782,
    1229,
    20,
    35,
    9,
    32
   ],
   "elder_2_NE_w2": [
    803,
    1229,
    19,
    35,
    9,
    32
   ],
   "elder_2_NE_w3": [
    823,
    1229,
    19,
    35,
    9,
    32
   ],
   "elder_2_NE_w4": [
    843,
    1229,
    19,
    35,
    9,
    31
   ],
   "elder_2_NE_w6": [
    863,
    1229,
    19,
    35,
    8,
    32
   ],
   "elder_2_NE_w7": [
    883,
    1229,
    20,
    35,
    9,
    31
   ],
   "elder_2_N_i0": [
    904,
    1229,
    14,
    35,
    7,
    32
   ],
   "elder_2_N_w2": [
    919,
    1229,
    14,
    35,
    7,
    32
   ],
   "elder_2_N_w4": [
    934,
    1229,
    14,
    35,
    7,
    31
   ],
   "elder_2_N_w5": [
    949,
    1229,
    15,
    35,
    7,
    32
   ],
   "elder_2_N_w6": [
    965,
    1229,
    15,
    35,
    7,
    32
   ],
   "elder_2_SE_w7": [
    981,
    1229,
    16,
    35,
    9,
    31
   ],
   "elder_2_S_w3": [
    998,
    1229,
    15,
    35,
    7,
    31
   ],
   "elder_2_S_w7": [
    0,
    1266,
    15,
    35,
    8,
    31
   ],
   "elf_2_NE_w0": [
    16,
    1266,
    18,
    35,
    8,
    32
   ],
   "elf_2_N_w0": [
    35,
    1266,
    14,
    35,
    7,
    32
   ],
   "elf_2_N_w4": [
    50,
    1266,
    14,
    35,
    7,
    32
   ],
   "farmer_2_E_i0": [
    65,
    1266,
    17,
    35,
    8,
    32
   ],
   "farmer_2_E_w0": [
    83,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w1": [
    101,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w2": [
    119,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w3": [
    137,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w4": [
    155,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w5": [
    173,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w6": [
    191,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_E_w7": [
    209,
    1266,
    17,
    35,
    7,
    32
   ],
   "farmer_2_NE_w0": [
    227,
    1266,
    19,
    35,
    8,
    32
   ],
   "farmer_2_N_w0": [
    247,
    1266,
    18,
    35,
    9,
    32
   ],
   "farmer_2_N_w2": [
    266,
    1266,
    17,
    35,
    9,
    33
   ],
   "farmer_2_N_w4": [
    284,
    1266,
    18,
    35,
    9,
    32
   ],
   "farmer_2_N_w6": [
    303,
    1266,
    17,
    35,
    8,
    33
   ],
   "farmer_2_SE_w4": [
    321,
    1266,
    18,
    35,
    8,
    31
   ],
   "farmer_2_S_i1": [
    340,
    1266,
    18,
    35,
    9,
    31
   ],
   "farmer_2_S_w0": [
    359,
    1266,
    18,
    35,
    9,
    31
   ],
   "farmer_2_S_w4": [
    378,
    1266,
    18,
    35,
    9,
    31
   ],
   "guard_1_NE_i1": [
    397,
    1266,
    15,
    35,
    6,
    33
   ],
   "guard_1_NE_w2": [
    413,
    1266,
    14,
    35,
    5,
    34
   ],
   "guard_1_NE_w5": [
    428,
    1266,
    14,
    35,
    5,
    34
   ],
   "guard_1_S_w1": [
    443,
    1266,
    14,
    35,
    7,
    32
   ],
   "guard_1_S_w5": [
    458,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_E_w0": [
    473,
    1266,
    19,
    35,
    10,
    32
   ],
   "hooded_2_E_w1": [
    493,
    1266,
    17,
    35,
    10,
    32
   ],
   "hooded_2_E_w2": [
    511,
    1266,
    17,
    35,
    10,
    32
   ],
   "hooded_2_E_w3": [
    529,
    1266,
    18,
    35,
    10,
    32
   ],
   "hooded_2_E_w4": [
    548,
    1266,
    19,
    35,
    10,
    32
   ],
   "hooded_2_E_w5": [
    568,
    1266,
    17,
    35,
    10,
    32
   ],
   "hooded_2_E_w6": [
    586,
    1266,
    17,
    35,
    10,
    32
   ],
   "hooded_2_E_w7": [
    604,
    1266,
    18,
    35,
    10,
    32
   ],
   "hooded_2_NE_w0": [
    623,
    1266,
    19,
    35,
    9,
    32
   ],
   "hooded_2_NE_w1": [
    643,
    1266,
    18,
    35,
    9,
    32
   ],
   "hooded_2_NE_w3": [
    662,
    1266,
    16,
    35,
    9,
    32
   ],
   "hooded_2_NE_w4": [
    679,
    1266,
    16,
    35,
    9,
    32
   ],
   "hooded_2_NE_w5": [
    696,
    1266,
    16,
    35,
    9,
    32
   ],
   "hooded_2_NE_w6": [
    713,
    1266,
    15,
    35,
    8,
    32
   ],
   "hooded_2_NE_w7": [
    729,
    1266,
    18,
    35,
    9,
    32
   ],
   "hooded_2_N_i0": [
    748,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_N_w0": [
    763,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_N_w1": [
    778,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_N_w3": [
    793,
    1266,
    15,
    35,
    8,
    32
   ],
   "hooded_2_N_w4": [
    809,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_N_w5": [
    824,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_N_w7": [
    839,
    1266,
    15,
    35,
    7,
    32
   ],
   "hooded_2_SE_w2": [
    855,
    1266,
    15,
    35,
    8,
    32
   ],
   "hooded_2_SE_w3": [
    871,
    1266,
    18,
    35,
    9,
    32
   ],
   "hooded_2_SE_w5": [
    890,
    1266,
    18,
    35,
    9,
    32
   ],
   "hooded_2_SE_w6": [
    909,
    1266,
    16,
    35,
    9,
    32
   ],
   "hooded_2_SE_w7": [
    926,
    1266,
    16,
    35,
    9,
    32
   ],
   "hooded_2_S_w1": [
    943,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_S_w2": [
    958,
    1266,
    15,
    35,
    7,
    32
   ],
   "hooded_2_S_w3": [
    974,
    1266,
    15,
    35,
    7,
    32
   ],
   "hooded_2_S_w5": [
    990,
    1266,
    14,
    35,
    7,
    32
   ],
   "hooded_2_S_w6": [
    1005,
    1266,
    15,
    35,
    8,
    32
   ],
   "hooded_2_S_w7": [
    0,
    1302,
    15,
    35,
    8,
    32
   ],
   "monk_2_E_w3": [
    16,
    1302,
    16,
    35,
    8,
    31
   ],
   "monk_2_E_w6": [
    33,
    1302,
    15,
    35,
    8,
    31
   ],
   "monk_2_E_w7": [
    49,
    1302,
    16,
    35,
    8,
    31
   ],
   "monk_2_NE_w0": [
    66,
    1302,
    17,
    35,
    7,
    31
   ],
   "monk_2_NE_w1": [
    84,
    1302,
    16,
    35,
    7,
    31
   ],
   "monk_2_NE_w3": [
    101,
    1302,
    15,
    35,
    8,
    31
   ],
   "monk_2_NE_w4": [
    117,
    1302,
    14,
    35,
    7,
    31
   ],
   "monk_2_NE_w5": [
    132,
    1302,
    13,
    35,
    7,
    31
   ],
   "monk_2_NE_w6": [
    146,
    1302,
    14,
    35,
    7,
    31
   ],
   "monk_2_NE_w7": [
    161,
    1302,
    16,
    35,
    7,
    31
   ],
   "monk_2_N_w0": [
    178,
    1302,
    14,
    35,
    7,
    31
   ],
   "monk_2_N_w1": [
    193,
    1302,
    14,
    35,
    7,
    31
   ],
   "monk_2_N_w2": [
    208,
    1302,
    15,
    35,
    8,
    31
   ],
   "monk_2_N_w3": [
    224,
    1302,
    15,
    35,
    8,
    31
   ],
   "monk_2_N_w4": [
    240,
    1302,
    14,
    35,
    7,
    31
   ],
   "monk_2_N_w5": [
    255,
    1302,
    14,
    35,
    7,
    31
   ],
   "monk_2_N_w6": [
    270,
    1302,
    15,
    35,
    7,
    31
   ],
   "monk_2_N_w7": [
    286,
    1302,
    15,
    35,
    7,
    31
   ],
   "noble_2_E_i0": [
    302,
    1302,
    12,
    35,
    6,
    32
   ],
   "noble_2_E_w0": [
    315,
    1302,
    16,
    35,
    7,
    31
   ],
   "noble_2_E_w1": [
    332,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_E_w3": [
    347,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_E_w4": [
    362,
    1302,
    16,
    35,
    7,
    31
   ],
   "noble_2_E_w5": [
    379,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_E_w6": [
    394,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_E_w7": [
    409,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_NE_i0": [
    424,
    1302,
    13,
    35,
    6,
    32
   ],
   "noble_2_N_i0": [
    438,
    1302,
    14,
    35,
    7,
    32
   ],
   "noble_2_SE_w0": [
    453,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_SE_w3": [
    468,
    1302,
    16,
    35,
    7,
    31
   ],
   "noble_2_SE_w4": [
    485,
    1302,
    17,
    35,
    7,
    31
   ],
   "noble_2_SE_w6": [
    503,
    1302,
    15,
    35,
    8,
    31
   ],
   "noble_2_SE_w7": [
    519,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_S_w0": [
    534,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_S_w3": [
    549,
    1302,
    15,
    35,
    7,
    31
   ],
   "noble_2_S_w4": [
    565,
    1302,
    14,
    35,
    7,
    31
   ],
   "noble_2_S_w7": [
    580,
    1302,
    15,
    35,
    8,
    31
   ],
   "orc_2_E_w2": [
    596,
    1302,
    14,
    35,
    7,
    34
   ],
   "orc_2_E_w3": [
    611,
    1302,
    16,
    35,
    7,
    34
   ],
   "orc_2_NE_i1": [
    628,
    1302,
    17,
    35,
    7,
    33
   ],
   "orc_2_NE_w2": [
    646,
    1302,
    17,
    35,
    7,
    34
   ],
   "orc_2_N_i1": [
    664,
    1302,
    20,
    35,
    10,
    33
   ],
   "orc_2_N_w1": [
    685,
    1302,
    19,
    35,
    9,
    34
   ],
   "orc_2_N_w5": [
    705,
    1302,
    19,
    35,
    9,
    34
   ],
   "orc_2_SE_w1": [
    725,
    1302,
    16,
    35,
    8,
    33
   ],
   "orc_2_SE_w3": [
    742,
    1302,
    20,
    35,
    9,
    33
   ],
   "orc_2_SE_w7": [
    763,
    1302,
    17,
    35,
    9,
    33
   ],
   "orc_2_S_i0": [
    781,
    1302,
    20,
    35,
    10,
    33
   ],
   "orc_2_S_w2": [
    802,
    1302,
    19,
    35,
    9,
    33
   ],
   "orc_2_S_w3": [
    822,
    1302,
    19,
    35,
    10,
    33
   ],
   "orc_2_S_w6": [
    842,
    1302,
    19,
    35,
    10,
    33
   ],
   "orc_2_S_w7": [
    862,
    1302,
    19,
    35,
    10,
    33
   ],
   "peasant_2_N_w0": [
    882,
    1302,
    14,
    35,
    7,
    32
   ],
   "peasant_2_N_w4": [
    897,
    1302,
    14,
    35,
    7,
    32
   ],
   "elder_2_E_i0": [
    912,
    1302,
    18,
    34,
    9,
    31
   ],
   "elder_2_E_w0": [
    931,
    1302,
    20,
    34,
    10,
    31
   ],
   "elder_2_E_w1": [
    952,
    1302,
    19,
    34,
    10,
    31
   ],
   "elder_2_E_w3": [
    972,
    1302,
    18,
    34,
    10,
    31
   ],
   "elder_2_E_w4": [
    991,
    1302,
    19,
    34,
    10,
    31
   ],
   "elder_2_E_w5": [
    0,
    1338,
    18,
    34,
    10,
    31
   ],
   "elder_2_E_w6": [
    19,
    1338,
    19,
    34,
    10,
    31
   ],
   "elder_2_NE_i1": [
    39,
    1338,
    18,
    34,
    8,
    31
   ],
   "elder_2_NE_w5": [
    58,
    1338,
    19,
    34,
    9,
    31
   ],
   "elder_2_N_i1": [
    78,
    1338,
    14,
    34,
    7,
    31
   ],
   "elder_2_SE_i0": [
    93,
    1338,
    15,
    34,
    8,
    31
   ],
   "elder_2_SE_w0": [
    109,
    1338,
    16,
    34,
    9,
    31
   ],
   "elder_2_SE_w1": [
    126,
    1338,
    15,
    34,
    9,
    31
   ],
   "elder_2_SE_w2": [
    142,
    1338,
    15,
    34,
    8,
    31
   ],
   "elder_2_SE_w3": [
    158,
    1338,
    18,
    34,
    9,
    31
   ],
   "elder_2_SE_w4": [
    177,
    1338,
    19,
    34,
    9,
    31
   ],
   "elder_2_SE_w5": [
    197,
    1338,
    18,
    34,
    9,
    31
   ],
   "elder_2_SE_w6": [
    216,
    1338,
    16,
    34,
    9,
    31
   ],
   "elder_2_S_i0": [
    233,
    1338,
    15,
    34,
    7,
    31
   ],
   "elder_2_S_w0": [
    249,
    1338,
    14,
    34,
    7,
    31
   ],
   "elder_2_S_w1": [
    264,
    1338,
    14,
    34,
    7,
    31
   ],
   "elder_2_S_w2": [
    279,
    1338,
    15,
    34,
    7,
    31
   ],
   "elder_2_S_w4": [
    295,
    1338,
    14,
    34,
    7,
    31
   ],
   "elder_2_S_w5": [
    310,
    1338,
    14,
    34,
    7,
    31
   ],
   "elder_2_S_w6": [
    325,
    1338,
    15,
    34,
    8,
    31
   ],
   "elf_2_E_i0": [
    341,
    1338,
    13,
    34,
    8,
    32
   ],
   "elf_2_E_w0": [
    355,
    1338,
    18,
    34,
    9,
    32
   ],
   "elf_2_E_w4": [
    374,
    1338,
    18,
    34,
    9,
    32
   ],
   "elf_2_E_w5": [
    393,
    1338,
    17,
    34,
    9,
    32
   ],
   "elf_2_E_w6": [
    411,
    1338,
    15,
    34,
    9,
    32
   ],
   "elf_2_E_w7": [
    427,
    1338,
    17,
    34,
    9,
    32
   ],
   "elf_2_NE_i0": [
    445,
    1338,
    14,
    34,
    7,
    32
   ],
   "elf_2_NE_w3": [
    460,
    1338,
    15,
    34,
    8,
    32
   ],
   "elf_2_NE_w4": [
    476,
    1338,
    14,
    34,
    8,
    32
   ],
   "elf_2_NE_w6": [
    491,
    1338,
    15,
    34,
    8,
    32
   ],
   "elf_2_NE_w7": [
    507,
    1338,
    17,
    34,
    8,
    32
   ],
   "elf_2_N_i0": [
    525,
    1338,
    14,
    34,
    7,
    32
   ],
   "elf_2_N_w2": [
    540,
    1338,
    13,
    34,
    7,
    33
   ],
   "elf_2_N_w3": [
    554,
    1338,
    13,
    34,
    7,
    32
   ],
   "elf_2_N_w6": [
    568,
    1338,
    13,
    34,
    6,
    33
   ],
   "elf_2_N_w7": [
    582,
    1338,
    13,
    34,
    6,
    32
   ],
   "elf_2_SE_i0": [
    596,
    1338,
    14,
    34,
    7,
    32
   ],
   "elf_2_SE_w1": [
    611,
    1338,
    14,
    34,
    8,
    32
   ],
   "elf_2_SE_w4": [
    626,
    1338,
    18,
    34,
    8,
    31
   ],
   "elf_2_SE_w5": [
    645,
    1338,
    17,
    34,
    8,
    31
   ],
   "elf_2_SE_w6": [
    663,
    1338,
    15,
    34,
    8,
    32
   ],
   "elf_2_S_i0": [
    679,
    1338,
    14,
    34,
    7,
    32
   ],
   "elf_2_S_w0": [
    694,
    1338,
    14,
    34,
    7,
    31
   ],
   "elf_2_S_w1": [
    709,
    1338,
    13,
    34,
    6,
    31
   ],
   "elf_2_S_w2": [
    723,
    1338,
    13,
    34,
    6,
    32
   ],
   "elf_2_S_w4": [
    737,
    1338,
    14,
    34,
    7,
    31
   ],
   "elf_2_S_w5": [
    752,
    1338,
    13,
    34,
    7,
    31
   ],
   "elf_2_S_w6": [
    766,
    1338,
    13,
    34,
    7,
    32
   ],
   "farmer_2_E_i1": [
    780,
    1338,
    17,
    34,
    8,
    31
   ],
   "farmer_2_NE_i0": [
    798,
    1338,
    19,
    34,
    8,
    32
   ],
   "farmer_2_NE_w2": [
    818,
    1338,
    19,
    34,
    8,
    33
   ],
   "farmer_2_NE_w3": [
    838,
    1338,
    18,
    34,
    8,
    32
   ],
   "farmer_2_NE_w4": [
    857,
    1338,
    18,
    34,
    8,
    32
   ],
   "farmer_2_NE_w5": [
    876,
    1338,
    18,
    34,
    7,
    32
   ],
   "farmer_2_NE_w6": [
    895,
    1338,
    18,
    34,
    7,
    32
   ],
   "farmer_2_NE_w7": [
    914,
    1338,
    18,
    34,
    7,
    32
   ],
   "farmer_2_N_i0": [
    933,
    1338,
    18,
    34,
    9,
    32
   ],
   "farmer_2_N_w3": [
    952,
    1338,
    17,
    34,
    9,
    32
   ],
   "farmer_2_N_w7": [
    970,
    1338,
    17,
    34,
    8,
    32
   ],
   "guard_0_N_i0": [
    988,
    1338,
    12,
    34,
    6,
    32
   ],
   "guard_0_N_w0": [
    1001,
    1338,
    12,
    34,
    6,
    32
   ],
   "guard_0_N_w3": [
    0,
    1373,
    13,
    34,
    7,
    32
   ],
   "guard_0_N_w7": [
    14,
    1373,
    13,
    34,
    6,
    32
   ],
   "guard_1_E_i0": [
    28,
    1373,
    14,
    34,
    6,
    32
   ],
   "guard_1_E_w0": [
    43,
    1373,
    15,
    34,
    6,
    32
   ],
   "guard_1_E_w4": [
    59,
    1373,
    14,
    34,
    6,
    32
   ],
   "guard_1_E_w5": [
    74,
    1373,
    12,
    34,
    5,
    32
   ],
   "guard_1_E_w6": [
    87,
    1373,
    13,
    34,
    5,
    32
   ],
   "guard_1_E_w7": [
    101,
    1373,
    13,
    34,
    5,
    32
   ],
   "guard_1_SE_w4": [
    115,
    1373,
    15,
    34,
    6,
    31
   ],
   "guard_1_SE_w5": [
    131,
    1373,
    14,
    34,
    6,
    31
   ],
   "guard_1_S_i0": [
    146,
    1373,
    14,
    34,
    7,
    32
   ],
   "guard_1_S_w0": [
    161,
    1373,
    14,
    34,
    7,
    31
   ],
   "guard_1_S_w2": [
    176,
    1373,
    14,
    34,
    7,
    32
   ],
   "guard_1_S_w3": [
    191,
    1373,
    14,
    34,
    7,
    32
   ],
   "guard_1_S_w4": [
    206,
    1373,
    14,
    34,
    7,
    31
   ],
   "guard_1_S_w6": [
    221,
    1373,
    14,
    34,
    7,
    32
   ],
   "guard_1_S_w7": [
    236,
    1373,
    14,
    34,
    7,
    32
   ],
   "hooded_2_E_i0": [
    251,
    1373,
    16,
    34,
    9,
    32
   ],
   "hooded_2_NE_i0": [
    268,
    1373,
    15,
    34,
    8,
    32
   ],
   "hooded_2_N_i1": [
    284,
    1373,
    14,
    34,
    7,
    31
   ],
   "hooded_2_SE_i0": [
    299,
    1373,
    15,
    34,
    8,
    32
   ],
   "hooded_2_SE_w0": [
    315,
    1373,
    16,
    34,
    9,
    31
   ],
   "hooded_2_SE_w1": [
    332,
    1373,
    16,
    34,
    9,
    32
   ],
   "hooded_2_SE_w4": [
    349,
    1373,
    19,
    34,
    9,
    31
   ],
   "hooded_2_S_i0": [
    369,
    1373,
    16,
    34,
    8,
    32
   ],
   "hooded_2_S_w0": [
    386,
    1373,
    14,
    34,
    7,
    31
   ],
   "hooded_2_S_w4": [
    401,
    1373,
    14,
    34,
    7,
    31
   ],
   "maid_2_NE_i0": [
    416,
    1373,
    13,
    34,
    6,
    32
   ],
   "maid_2_NE_w0": [
    430,
    1373,
    17,
    34,
    7,
    31
   ],
   "maid_2_NE_w1": [
    448,
    1373,
    16,
    34,
    7,
    32
   ],
   "maid_2_NE_w2": [
    465,
    1373,
    15,
    34,
    8,
    32
   ],
   "maid_2_NE_w3": [
    481,
    1373,
    15,
    34,
    8,
    32
   ],
   "maid_2_NE_w6": [
    497,
    1373,
    14,
    34,
    7,
    32
   ],
   "maid_2_N_i0": [
    512,
    1373,
    14,
    34,
    7,
    32
   ],
   "maid_2_N_w0": [
    527,
    1373,
    14,
    34,
    7,
    31
   ],
   "maid_2_N_w1": [
    542,
    1373,
    14,
    34,
    7,
    32
   ],
   "maid_2_N_w2": [
    557,
    1373,
    15,
    34,
    8,
    32
   ],
   "maid_2_N_w3": [
    573,
    1373,
    15,
    34,
    8,
    32
   ],
   "maid_2_N_w4": [
    589,
    1373,
    14,
    34,
    7,
    31
   ],
   "maid_2_N_w5": [
    604,
    1373,
    14,
    34,
    7,
    32
   ],
   "maid_2_N_w6": [
    619,
    1373,
    15,
    34,
    7,
    32
   ],
   "maid_2_N_w7": [
    635,
    1373,
    15,
    34,
    7,
    32
   ],
   "maid_2_SE_w4": [
    651,
    1373,
    17,
    34,
    7,
    31
   ],
   "maid_2_SE_w5": [
    669,
    1373,
    16,
    34,
    7,
    31
   ],
   "maid_2_S_w0": [
    686,
    1373,
    14,
    34,
    7,
    31
   ],
   "maid_2_S_w1": [
    701,
    1373,
    14,
    34,
    7,
    31
   ],
   "maid_2_S_w4": [
    716,
    1373,
    14,
    34,
    7,
    31
   ],
   "maid_2_S_w5": [
    731,
    1373,
    14,
    34,
    7,
    31
   ],
   "monk_2_E_i0": [
    746,
    1373,
    12,
    34,
    6,
    31
   ],
   "monk_2_E_w0": [
    759,
    1373,
    16,
    34,
    7,
    30
   ],
   "monk_2_E_w1": [
    776,
    1373,
    14,
    34,
    7,
    31
   ],
   "monk_2_E_w2": [
    791,
    1373,
    15,
    34,
    8,
    31
   ],
   "monk_2_E_w4": [
    807,
    1373,
    16,
    34,
    7,
    30
   ],
   "monk_2_E_w5": [
    824,
    1373,
    14,
    34,
    7,
    31
   ],
   "monk_2_NE_i0": [
    839,
    1373,
    13,
    34,
    6,
    31
   ],
   "monk_2_NE_w2": [
    853,
    1373,
    15,
    34,
    8,
    31
   ],
   "monk_2_N_i0": [
    869,
    1373,
    14,
    34,
    7,
    31
   ],
   "monk_2_SE_i0": [
    884,
    1373,
    13,
    34,
    6,
    31
   ],
   "monk_2_SE_w0": [
    898,
    1373,
    14,
    34,
    7,
    30
   ],
   "monk_2_SE_w2": [
    913,
    1373,
    14,
    34,
    7,
    31
   ],
   "monk_2_SE_w3": [
    928,
    1373,
    16,
    34,
    7,
    30
   ],
   "monk_2_SE_w4": [
    945,
    1373,
    17,
    34,
    7,
    30
   ],
   "monk_2_SE_w7": [
    963,
    1373,
    15,
    34,
    8,
    30
   ],
   "monk_2_S_i0": [
    979,
    1373,
    16,
    34,
    8,
    31
   ],
   "monk_2_S_w0": [
    996,
    1373,
    14,
    34,
    7,
    30
   ],
   "monk_2_S_w3": [
    0,
    1408,
    15,
    34,
    7,
    30
   ],
   "monk_2_S_w4": [
    16,
    1408,
    14,
    34,
    7,
    30
   ],
   "monk_2_S_w7": [
    31,
    1408,
    15,
    34,
    8,
    30
   ],
   "noble_2_E_i1": [
    47,
    1408,
    12,
    34,
    6,
    31
   ],
   "noble_2_NE_i1": [
    60,
    1408,
    13,
    34,
    6,
    31
   ],
   "noble_2_N_i1": [
    74,
    1408,
    14,
    34,
    7,
    31
   ],
   "noble_2_SE_i0": [
    89,
    1408,
    13,
    34,
    6,
    31
   ],
   "noble_2_SE_w1": [
    103,
    1408,
    13,
    34,
    7,
    31
   ],
   "noble_2_SE_w2": [
    117,
    1408,
    14,
    34,
    7,
    31
   ],
   "noble_2_SE_w5": [
    132,
    1408,
    16,
    34,
    7,
    31
   ],
   "noble_2_S_i0": [
    149,
    1408,
    14,
    34,
    7,
    31
   ],
   "noble_2_S_w1": [
    164,
    1408,
    13,
    34,
    6,
    31
   ],
   "noble_2_S_w2": [
    178,
    1408,
    14,
    34,
    7,
    31
   ],
   "noble_2_S_w5": [
    193,
    1408,
    13,
    34,
    7,
    31
   ],
   "noble_2_S_w6": [
    207,
    1408,
    14,
    34,
    7,
    31
   ],
   "orc_2_S_i1": [
    222,
    1408,
    20,
    34,
    10,
    32
   ],
   "peasant_2_NE_i0": [
    243,
    1408,
    13,
    34,
    6,
    32
   ],
   "peasant_2_NE_w0": [
    257,
    1408,
    17,
    34,
    7,
    31
   ],
   "peasant_2_NE_w3": [
    275,
    1408,
    12,
    34,
    5,
    32
   ],
   "peasant_2_NE_w5": [
    288,
    1408,
    11,
    34,
    5,
    32
   ],
   "peasant_2_NE_w6": [
    300,
    1408,
    12,
    34,
    5,
    32
   ],
   "peasant_2_NE_w7": [
    313,
    1408,
    15,
    34,
    6,
    32
   ],
   "peasant_2_N_i0": [
    329,
    1408,
    14,
    34,
    7,
    32
   ],
   "peasant_2_N_w2": [
    344,
    1408,
    14,
    34,
    7,
    32
   ],
   "peasant_2_N_w3": [
    359,
    1408,
    14,
    34,
    7,
    32
   ],
   "peasant_2_N_w6": [
    374,
    1408,
    14,
    34,
    7,
    32
   ],
   "peasant_2_N_w7": [
    389,
    1408,
    14,
    34,
    7,
    32
   ],
   "peasant_2_SE_w4": [
    404,
    1408,
    17,
    34,
    7,
    31
   ],
   "peasant_2_SE_w5": [
    422,
    1408,
    16,
    34,
    7,
    31
   ],
   "peasant_2_S_w0": [
    439,
    1408,
    14,
    34,
    7,
    31
   ],
   "peasant_2_S_w1": [
    454,
    1408,
    14,
    34,
    7,
    31
   ],
   "peasant_2_S_w4": [
    469,
    1408,
    14,
    34,
    7,
    31
   ],
   "peasant_2_S_w5": [
    484,
    1408,
    14,
    34,
    7,
    31
   ],
   "woman_2_S_i0": [
    499,
    1408,
    18,
    34,
    10,
    32
   ],
   "woman_2_S_t0": [
    518,
    1408,
    18,
    34,
    10,
    32
   ],
   "woman_2_S_t1": [
    537,
    1408,
    17,
    34,
    9,
    32
   ],
   "dwarf_3_E_i0": [
    555,
    1408,
    15,
    33,
    7,
    30
   ],
   "dwarf_3_NE_i0": [
    571,
    1408,
    18,
    33,
    8,
    30
   ],
   "dwarf_3_NE_w0": [
    590,
    1408,
    20,
    33,
    10,
    29
   ],
   "dwarf_3_NE_w6": [
    611,
    1408,
    17,
    33,
    7,
    30
   ],
   "dwarf_3_NE_w7": [
    629,
    1408,
    20,
    33,
    9,
    30
   ],
   "dwarf_3_N_w0": [
    650,
    1408,
    20,
    33,
    10,
    30
   ],
   "dwarf_3_N_w3": [
    671,
    1408,
    20,
    33,
    10,
    30
   ],
   "dwarf_3_N_w4": [
    692,
    1408,
    20,
    33,
    10,
    30
   ],
   "dwarf_3_N_w7": [
    713,
    1408,
    21,
    33,
    10,
    30
   ],
   "dwarf_3_SE_i0": [
    735,
    1408,
    19,
    33,
    10,
    30
   ],
   "dwarf_3_SE_w4": [
    755,
    1408,
    23,
    33,
    11,
    29
   ],
   "dwarf_3_S_i0": [
    779,
    1408,
    20,
    33,
    10,
    30
   ],
   "dwarf_3_S_w0": [
    800,
    1408,
    20,
    33,
    10,
    29
   ],
   "dwarf_3_S_w4": [
    821,
    1408,
    20,
    33,
    10,
    29
   ],
   "elder_2_E_i1": [
    842,
    1408,
    17,
    33,
    9,
    30
   ],
   "elder_2_SE_i1": [
    860,
    1408,
    15,
    33,
    8,
    30
   ],
   "elder_2_S_i1": [
    876,
    1408,
    14,
    33,
    7,
    30
   ],
   "elf_2_E_i1": [
    891,
    1408,
    13,
    33,
    8,
    31
   ],
   "elf_2_E_w1": [
    905,
    1408,
    17,
    33,
    9,
    32
   ],
   "elf_2_E_w2": [
    923,
    1408,
    15,
    33,
    9,
    32
   ],
   "elf_2_E_w3": [
    939,
    1408,
    17,
    33,
    9,
    32
   ],
   "elf_2_NE_i1": [
    957,
    1408,
    14,
    33,
    7,
    31
   ],
   "elf_2_NE_w1": [
    972,
    1408,
    17,
    33,
    8,
    32
   ],
   "elf_2_NE_w2": [
    990,
    1408,
    15,
    33,
    8,
    32
   ],
   "elf_2_NE_w5": [
    1006,
    1408,
    14,
    33,
    8,
    32
   ],
   "elf_2_N_i1": [
    0,
    1443,
    14,
    33,
    7,
    31
   ],
   "elf_2_N_w1": [
    15,
    1443,
    13,
    33,
    7,
    32
   ],
   "elf_2_N_w5": [
    29,
    1443,
    13,
    33,
    6,
    32
   ],
   "elf_2_SE_i1": [
    43,
    1443,
    14,
    33,
    7,
    31
   ],
   "elf_2_SE_w0": [
    58,
    1443,
    15,
    33,
    8,
    31
   ],
   "elf_2_SE_w2": [
    74,
    1443,
    15,
    33,
    8,
    32
   ],
   "elf_2_SE_w3": [
    90,
    1443,
    17,
    33,
    8,
    32
   ],
   "elf_2_SE_w7": [
    108,
    1443,
    15,
    33,
    8,
    31
   ],
   "elf_2_S_i1": [
    124,
    1443,
    14,
    33,
    7,
    31
   ],
   "elf_2_S_w3": [
    139,
    1443,
    13,
    33,
    6,
    31
   ],
   "elf_2_S_w7": [
    153,
    1443,
    13,
    33,
    7,
    31
   ],
   "farmer_2_NE_i1": [
    167,
    1443,
    19,
    33,
    8,
    31
   ],
   "farmer_2_NE_w1": [
    187,
    1443,
    19,
    33,
    8,
    32
   ],
   "farmer_2_N_i1": [
    207,
    1443,
    18,
    33,
    9,
    31
   ],
   "farmer_2_N_w1": [
    226,
    1443,
    17,
    33,
    9,
    32
   ],
   "farmer_2_N_w5": [
    244,
    1443,
    17,
    33,
    8,
    32
   ],
   "guard_0_NE_i0": [
    262,
    1443,
    13,
    33,
    5,
    31
   ],
   "guard_0_NE_w6": [
    276,
    1443,
    14,
    33,
    5,
    31
   ],
   "guard_0_NE_w7": [
    291,
    1443,
    14,
    33,
    5,
    31
   ],
   "guard_0_N_i1": [
    306,
    1443,
    12,
    33,
    6,
    31
   ],
   "guard_0_N_w1": [
    319,
    1443,
    13,
    33,
    7,
    32
   ],
   "guard_0_N_w2": [
    333,
    1443,
    13,
    33,
    7,
    32
   ],
   "guard_0_N_w4": [
    347,
    1443,
    12,
    33,
    6,
    31
   ],
   "guard_0_N_w5": [
    360,
    1443,
    13,
    33,
    6,
    32
   ],
   "guard_0_N_w6": [
    374,
    1443,
    13,
    33,
    6,
    32
   ],
   "guard_1_E_i1": [
    388,
    1443,
    14,
    33,
    6,
    31
   ],
   "guard_1_E_w1": [
    403,
    1443,
    13,
    33,
    5,
    32
   ],
   "guard_1_E_w2": [
    417,
    1443,
    13,
    33,
    5,
    32
   ],
   "guard_1_E_w3": [
    431,
    1443,
    12,
    33,
    5,
    32
   ],
   "guard_1_SE_i0": [
    444,
    1443,
    12,
    33,
    6,
    31
   ],
   "guard_1_SE_w0": [
    457,
    1443,
    11,
    33,
    5,
    31
   ],
   "guard_1_SE_w1": [
    469,
    1443,
    11,
    33,
    5,
    31
   ],
   "guard_1_SE_w3": [
    481,
    1443,
    14,
    33,
    5,
    31
   ],
   "guard_1_SE_w6": [
    496,
    1443,
    12,
    33,
    6,
    31
   ],
   "guard_1_SE_w7": [
    509,
    1443,
    11,
    33,
    5,
    31
   ],
   "guard_1_S_i1": [
    521,
    1443,
    14,
    33,
    7,
    31
   ],
   "hooded_2_E_i1": [
    536,
    1443,
    16,
    33,
    9,
    31
   ],
   "hooded_2_NE_i1": [
    553,
    1443,
    15,
    33,
    8,
    31
   ],
   "hooded_2_SE_i1": [
    569,
    1443,
    15,
    33,
    8,
    31
   ],
   "hooded_2_S_i1": [
    585,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_E_i0": [
    600,
    1443,
    12,
    33,
    6,
    31
   ],
   "maid_2_E_w0": [
    613,
    1443,
    16,
    33,
    7,
    31
   ],
   "maid_2_E_w2": [
    630,
    1443,
    15,
    33,
    8,
    32
   ],
   "maid_2_E_w3": [
    646,
    1443,
    16,
    33,
    8,
    31
   ],
   "maid_2_E_w4": [
    663,
    1443,
    16,
    33,
    7,
    31
   ],
   "maid_2_E_w5": [
    680,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_E_w6": [
    695,
    1443,
    15,
    33,
    8,
    31
   ],
   "maid_2_E_w7": [
    711,
    1443,
    16,
    33,
    8,
    31
   ],
   "maid_2_NE_i1": [
    728,
    1443,
    13,
    33,
    6,
    31
   ],
   "maid_2_NE_w4": [
    742,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_NE_w5": [
    757,
    1443,
    13,
    33,
    7,
    31
   ],
   "maid_2_NE_w7": [
    771,
    1443,
    16,
    33,
    7,
    31
   ],
   "maid_2_N_i1": [
    788,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_SE_i0": [
    803,
    1443,
    13,
    33,
    6,
    31
   ],
   "maid_2_SE_w0": [
    817,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_SE_w1": [
    832,
    1443,
    13,
    33,
    7,
    31
   ],
   "maid_2_SE_w2": [
    846,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_SE_w3": [
    861,
    1443,
    16,
    33,
    7,
    31
   ],
   "maid_2_SE_w6": [
    878,
    1443,
    15,
    33,
    8,
    31
   ],
   "maid_2_SE_w7": [
    894,
    1443,
    15,
    33,
    8,
    31
   ],
   "maid_2_S_i0": [
    910,
    1443,
    16,
    33,
    8,
    31
   ],
   "maid_2_S_w2": [
    927,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_S_w3": [
    942,
    1443,
    15,
    33,
    7,
    31
   ],
   "maid_2_S_w6": [
    958,
    1443,
    14,
    33,
    7,
    31
   ],
   "maid_2_S_w7": [
    973,
    1443,
    15,
    33,
    8,
    31
   ],
   "mercenary_2_E_i0": [
    989,
    1443,
    13,
    33,
    7,
    31
   ],
   "mercenary_2_E_t0": [
    1003,
    1443,
    15,
    33,
    7,
    31
   ],
   "mercenary_2_E_t1": [
    0,
    1477,
    15,
    33,
    7,
    31
   ],
   "monk_2_E_i1": [
    16,
    1477,
    12,
    33,
    6,
    30
   ],
   "monk_2_NE_i1": [
    29,
    1477,
    13,
    33,
    6,
    30
   ],
   "monk_2_N_i1": [
    43,
    1477,
    14,
    33,
    7,
    30
   ],
   "monk_2_SE_i1": [
    58,
    1477,
    13,
    33,
    6,
    30
   ],
   "monk_2_SE_w1": [
    72,
    1477,
    13,
    33,
    7,
    30
   ],
   "monk_2_SE_w5": [
    86,
    1477,
    16,
    33,
    7,
    30
   ],
   "monk_2_SE_w6": [
    103,
    1477,
    15,
    33,
    8,
    30
   ],
   "monk_2_S_i1": [
    119,
    1477,
    14,
    33,
    7,
    30
   ],
   "monk_2_S_w1": [
    134,
    1477,
    14,
    33,
    7,
    30
   ],
   "monk_2_S_w2": [
    149,
    1477,
    14,
    33,
    7,
    30
   ],
   "monk_2_S_w5": [
    164,
    1477,
    14,
    33,
    7,
    30
   ],
   "monk_2_S_w6": [
    179,
    1477,
    14,
    33,
    7,
    30
   ],
   "noble_1_NE_w3": [
    194,
    1477,
    14,
    33,
    7,
    29
   ],
   "noble_1_NE_w5": [
    209,
    1477,
    12,
    33,
    6,
    29
   ],
   "noble_1_NE_w7": [
    222,
    1477,
    15,
    33,
    7,
    29
   ],
   "noble_1_N_w1": [
    238,
    1477,
    12,
    33,
    6,
    29
   ],
   "noble_1_N_w3": [
    251,
    1477,
    14,
    33,
    7,
    29
   ],
   "noble_1_N_w5": [
    266,
    1477,
    12,
    33,
    6,
    29
   ],
   "noble_1_N_w7": [
    279,
    1477,
    14,
    33,
    7,
    29
   ],
   "noble_2_SE_i1": [
    294,
    1477,
    13,
    33,
    6,
    30
   ],
   "noble_2_S_i1": [
    308,
    1477,
    14,
    33,
    7,
    30
   ],
   "peasant_2_E_i0": [
    323,
    1477,
    11,
    33,
    5,
    31
   ],
   "peasant_2_E_w0": [
    335,
    1477,
    15,
    33,
    6,
    31
   ],
   "peasant_2_E_w2": [
    351,
    1477,
    11,
    33,
    4,
    32
   ],
   "peasant_2_E_w4": [
    363,
    1477,
    15,
    33,
    6,
    31
   ],
   "peasant_2_E_w5": [
    379,
    1477,
    12,
    33,
    5,
    31
   ],
   "peasant_2_E_w6": [
    392,
    1477,
    11,
    33,
    4,
    31
   ],
   "peasant_2_E_w7": [
    404,
    1477,
    12,
    33,
    5,
    31
   ],
   "peasant_2_NE_i1": [
    417,
    1477,
    13,
    33,
    6,
    31
   ],
   "peasant_2_NE_w1": [
    431,
    1477,
    16,
    33,
    7,
    32
   ],
   "peasant_2_NE_w2": [
    448,
    1477,
    12,
    33,
    5,
    32
   ],
   "peasant_2_NE_w4": [
    461,
    1477,
    13,
    33,
    6,
    31
   ],
   "peasant_2_N_i1": [
    475,
    1477,
    14,
    33,
    7,
    31
   ],
   "peasant_2_N_w1": [
    490,
    1477,
    14,
    33,
    7,
    32
   ],
   "peasant_2_N_w5": [
    505,
    1477,
    14,
    33,
    7,
    32
   ],
   "peasant_2_SE_i0": [
    520,
    1477,
    13,
    33,
    6,
    31
   ],
   "peasant_2_SE_w0": [
    534,
    1477,
    13,
    33,
    6,
    31
   ],
   "peasant_2_SE_w1": [
    548,
    1477,
    11,
    33,
    5,
    31
   ],
   "peasant_2_SE_w2": [
    560,
    1477,
    12,
    33,
    5,
    31
   ],
   "peasant_2_SE_w3": [
    573,
    1477,
    15,
    33,
    6,
    31
   ],
   "peasant_2_SE_w6": [
    589,
    1477,
    12,
    33,
    5,
    31
   ],
   "peasant_2_SE_w7": [
    602,
    1477,
    12,
    33,
    5,
    31
   ],
   "peasant_2_S_i0": [
    615,
    1477,
    16,
    33,
    8,
    31
   ],
   "peasant_2_S_w2": [
    632,
    1477,
    14,
    33,
    7,
    31
   ],
   "peasant_2_S_w3": [
    647,
    1477,
    14,
    33,
    7,
    31
   ],
   "peasant_2_S_w6": [
    662,
    1477,
    14,
    33,
    7,
    31
   ],
   "peasant_2_S_w7": [
    677,
    1477,
    14,
    33,
    7,
    31
   ],
   "woman_2_S_i1": [
    692,
    1477,
    17,
    33,
    10,
    31
   ],
   "dwarf_3_E_i1": [
    710,
    1477,
    15,
    32,
    7,
    29
   ],
   "dwarf_3_E_w0": [
    726,
    1477,
    16,
    32,
    7,
    29
   ],
   "dwarf_3_E_w4": [
    743,
    1477,
    16,
    32,
    7,
    29
   ],
   "dwarf_3_E_w5": [
    760,
    1477,
    16,
    32,
    7,
    29
   ],
   "dwarf_3_E_w6": [
    777,
    1477,
    15,
    32,
    6,
    29
   ],
   "dwarf_3_E_w7": [
    793,
    1477,
    15,
    32,
    6,
    29
   ],
   "dwarf_3_NE_i1": [
    809,
    1477,
    18,
    32,
    8,
    29
   ],
   "dwarf_3_NE_w1": [
    828,
    1477,
    19,
    32,
    9,
    30
   ],
   "dwarf_3_NE_w3": [
    848,
    1477,
    17,
    32,
    8,
    30
   ],
   "dwarf_3_NE_w5": [
    866,
    1477,
    17,
    32,
    7,
    30
   ],
   "dwarf_3_N_i0": [
    884,
    1477,
    20,
    32,
    10,
    30
   ],
   "dwarf_3_N_w1": [
    905,
    1477,
    20,
    32,
    10,
    30
   ],
   "dwarf_3_N_w2": [
    926,
    1477,
    20,
    32,
    10,
    30
   ],
   "dwarf_3_N_w5": [
    947,
    1477,
    21,
    32,
    10,
    30
   ],
   "dwarf_3_N_w6": [
    969,
    1477,
    21,
    32,
    10,
    30
   ],
   "dwarf_3_SE_i1": [
    991,
    1477,
    19,
    32,
    10,
    29
   ],
   "dwarf_3_SE_w0": [
    0,
    1511,
    19,
    32,
    10,
    29
   ],
   "dwarf_3_SE_w5": [
    20,
    1511,
    22,
    32,
    11,
    29
   ],
   "dwarf_3_SE_w6": [
    43,
    1511,
    19,
    32,
    10,
    29
   ],
   "dwarf_3_S_i1": [
    63,
    1511,
    20,
    32,
    10,
    29
   ],
   "dwarf_3_S_w1": [
    84,
    1511,
    20,
    32,
    10,
    29
   ],
   "dwarf_3_S_w2": [
    105,
    1511,
    20,
    32,
    10,
    29
   ],
   "dwarf_3_S_w5": [
    126,
    1511,
    21,
    32,
    11,
    29
   ],
   "dwarf_3_S_w6": [
    148,
    1511,
    21,
    32,
    11,
    29
   ],
   "elder_1_NE_w2": [
    170,
    1511,
    17,
    32,
    8,
    29
   ],
   "elder_1_NE_w6": [
    188,
    1511,
    18,
    32,
    8,
    29
   ],
   "elder_1_N_w0": [
    207,
    1511,
    13,
    32,
    6,
    29
   ],
   "elder_1_N_w1": [
    221,
    1511,
    13,
    32,
    7,
    29
   ],
   "elder_1_N_w2": [
    235,
    1511,
    13,
    32,
    7,
    29
   ],
   "elder_1_N_w3": [
    249,
    1511,
    14,
    32,
    7,
    29
   ],
   "elder_1_N_w5": [
    264,
    1511,
    13,
    32,
    6,
    29
   ],
   "elder_1_N_w6": [
    278,
    1511,
    13,
    32,
    6,
    29
   ],
   "elder_1_N_w7": [
    292,
    1511,
    14,
    32,
    7,
    29
   ],
   "guard_0_NE_i1": [
    307,
    1511,
    13,
    32,
    5,
    30
   ],
   "guard_0_NE_w0": [
    321,
    1511,
    15,
    32,
    6,
    30
   ],
   "guard_0_NE_w1": [
    337,
    1511,
    14,
    32,
    5,
    31
   ],
   "guard_0_NE_w2": [
    352,
    1511,
    13,
    32,
    5,
    31
   ],
   "guard_0_NE_w4": [
    366,
    1511,
    13,
    32,
    5,
    30
   ],
   "guard_1_SE_i1": [
    380,
    1511,
    12,
    32,
    6,
    30
   ],
   "guard_1_SE_w2": [
    393,
    1511,
    12,
    32,
    5,
    31
   ],
   "maid_2_E_i1": [
    406,
    1511,
    13,
    32,
    7,
    30
   ],
   "maid_2_E_w1": [
    420,
    1511,
    14,
    32,
    7,
    31
   ],
   "maid_2_SE_i1": [
    435,
    1511,
    13,
    32,
    6,
    30
   ],
   "maid_2_S_i1": [
    449,
    1511,
    14,
    32,
    7,
    30
   ],
   "mercenary_2_E_i1": [
    464,
    1511,
    13,
    32,
    7,
    30
   ],
   "noble_1_E_w0": [
    478,
    1511,
    14,
    32,
    6,
    28
   ],
   "noble_1_E_w2": [
    493,
    1511,
    13,
    32,
    7,
    29
   ],
   "noble_1_E_w3": [
    507,
    1511,
    14,
    32,
    7,
    28
   ],
   "noble_1_E_w4": [
    522,
    1511,
    14,
    32,
    6,
    28
   ],
   "noble_1_E_w7": [
    537,
    1511,
    14,
    32,
    7,
    28
   ],
   "noble_1_NE_i0": [
    552,
    1511,
    11,
    32,
    5,
    29
   ],
   "noble_1_NE_w0": [
    564,
    1511,
    15,
    32,
    6,
    28
   ],
   "noble_1_NE_w1": [
    580,
    1511,
    14,
    32,
    6,
    29
   ],
   "noble_1_NE_w2": [
    595,
    1511,
    13,
    32,
    7,
    29
   ],
   "noble_1_NE_w4": [
    609,
    1511,
    12,
    32,
    6,
    28
   ],
   "noble_1_NE_w6": [
    622,
    1511,
    13,
    32,
    7,
    29
   ],
   "noble_1_N_i0": [
    636,
    1511,
    14,
    32,
    7,
    29
   ],
   "noble_1_N_w0": [
    651,
    1511,
    12,
    32,
    6,
    28
   ],
   "noble_1_N_w2": [
    664,
    1511,
    13,
    32,
    7,
    29
   ],
   "noble_1_N_w4": [
    678,
    1511,
    12,
    32,
    6,
    28
   ],
   "noble_1_N_w6": [
    691,
    1511,
    13,
    32,
    6,
    29
   ],
   "noble_1_SE_w0": [
    705,
    1511,
    12,
    32,
    6,
    28
   ],
   "noble_1_SE_w3": [
    718,
    1511,
    15,
    32,
    7,
    28
   ],
   "noble_1_SE_w4": [
    734,
    1511,
    15,
    32,
    6,
    28
   ],
   "noble_1_SE_w7": [
    750,
    1511,
    14,
    32,
    7,
    28
   ],
   "noble_1_S_w3": [
    765,
    1511,
    14,
    32,
    7,
    28
   ],
   "noble_1_S_w7": [
    780,
    1511,
    14,
    32,
    7,
    28
   ],
   "peasant_2_E_i1": [
    795,
    1511,
    11,
    32,
    5,
    30
   ],
   "peasant_2_E_w1": [
    807,
    1511,
    12,
    32,
    5,
    31
   ],
   "peasant_2_E_w3": [
    820,
    1511,
    12,
    32,
    5,
    31
   ],
   "peasant_2_SE_i1": [
    833,
    1511,
    13,
    32,
    6,
    30
   ],
   "peasant_2_S_i1": [
    847,
    1511,
    14,
    32,
    7,
    30
   ],
   "dwarf_3_E_w1": [
    862,
    1511,
    15,
    31,
    6,
    29
   ],
   "dwarf_3_E_w2": [
    878,
    1511,
    15,
    31,
    6,
    30
   ],
   "dwarf_3_E_w3": [
    894,
    1511,
    16,
    31,
    7,
    29
   ],
   "dwarf_3_NE_w2": [
    911,
    1511,
    18,
    31,
    8,
    30
   ],
   "dwarf_3_NE_w4": [
    930,
    1511,
    16,
    31,
    7,
    29
   ],
   "dwarf_3_N_i1": [
    947,
    1511,
    20,
    31,
    10,
    29
   ],
   "dwarf_3_SE_w1": [
    968,
    1511,
    18,
    31,
    9,
    29
   ],
   "dwarf_3_SE_w2": [
    987,
    1511,
    19,
    31,
    10,
    29
   ],
   "dwarf_3_SE_w3": [
    0,
    1544,
    21,
    31,
    10,
    29
   ],
   "dwarf_3_SE_w7": [
    22,
    1544,
    18,
    31,
    10,
    29
   ],
   "dwarf_3_S_w3": [
    41,
    1544,
    20,
    31,
    10,
    29
   ],
   "dwarf_3_S_w7": [
    62,
    1544,
    21,
    31,
    11,
    29
   ],
   "elder_1_E_w0": [
    84,
    1544,
    18,
    31,
    9,
    28
   ],
   "elder_1_E_w1": [
    103,
    1544,
    18,
    31,
    9,
    28
   ],
   "elder_1_E_w2": [
    122,
    1544,
    17,
    31,
    9,
    28
   ],
   "elder_1_E_w3": [
    140,
    1544,
    17,
    31,
    9,
    28
   ],
   "elder_1_E_w4": [
    158,
    1544,
    17,
    31,
    9,
    28
   ],
   "elder_1_E_w5": [
    176,
    1544,
    17,
    31,
    9,
    28
   ],
   "elder_1_E_w6": [
    194,
    1544,
    17,
    31,
    9,
    28
   ],
   "elder_1_E_w7": [
    212,
    1544,
    18,
    31,
    9,
    28
   ],
   "elder_1_NE_w0": [
    231,
    1544,
    18,
    31,
    8,
    28
   ],
   "elder_1_NE_w1": [
    250,
    1544,
    18,
    31,
    8,
    28
   ],
   "elder_1_NE_w3": [
    269,
    1544,
    17,
    31,
    8,
    28
   ],
   "elder_1_NE_w4": [
    287,
    1544,
    17,
    31,
    8,
    28
   ],
   "elder_1_NE_w5": [
    305,
    1544,
    17,
    31,
    8,
    28
   ],
   "elder_1_NE_w7": [
    323,
    1544,
    18,
    31,
    8,
    28
   ],
   "elder_1_N_i0": [
    342,
    1544,
    14,
    31,
    7,
    29
   ],
   "elder_1_N_w4": [
    357,
    1544,
    13,
    31,
    6,
    28
   ],
   "elder_1_SE_w0": [
    371,
    1544,
    14,
    31,
    8,
    28
   ],
   "elder_1_SE_w1": [
    386,
    1544,
    14,
    31,
    8,
    28
   ],
   "elder_1_SE_w2": [
    401,
    1544,
    15,
    31,
    8,
    28
   ],
   "elder_1_SE_w3": [
    417,
    1544,
    17,
    31,
    8,
    28
   ],
   "elder_1_SE_w4": [
    435,
    1544,
    17,
    31,
    8,
    28
   ],
   "elder_1_SE_w5": [
    453,
    1544,
    16,
    31,
    8,
    28
   ],
   "elder_1_SE_w6": [
    470,
    1544,
    14,
    31,
    8,
    28
   ],
   "elder_1_SE_w7": [
    485,
    1544,
    15,
    31,
    8,
    28
   ],
   "elder_1_S_w0": [
    501,
    1544,
    13,
    31,
    7,
    28
   ],
   "elder_1_S_w1": [
    515,
    1544,
    13,
    31,
    6,
    28
   ],
   "elder_1_S_w2": [
    529,
    1544,
    13,
    31,
    6,
    28
   ],
   "elder_1_S_w3": [
    543,
    1544,
    14,
    31,
    7,
    28
   ],
   "elder_1_S_w4": [
    558,
    1544,
    13,
    31,
    7,
    28
   ],
   "elder_1_S_w5": [
    572,
    1544,
    13,
    31,
    7,
    28
   ],
   "elder_1_S_w6": [
    586,
    1544,
    13,
    31,
    7,
    28
   ],
   "elder_1_S_w7": [
    600,
    1544,
    14,
    31,
    7,
    28
   ],
   "guard_0_E_i0": [
    615,
    1544,
    12,
    31,
    5,
    29
   ],
   "guard_0_E_w0": [
    628,
    1544,
    13,
    31,
    5,
    29
   ],
   "guard_0_E_w6": [
    642,
    1544,
    12,
    31,
    5,
    29
   ],
   "guard_0_E_w7": [
    655,
    1544,
    13,
    31,
    5,
    29
   ],
   "guard_0_NE_w3": [
    669,
    1544,
    13,
    31,
    5,
    30
   ],
   "guard_0_NE_w5": [
    683,
    1544,
    13,
    31,
    5,
    30
   ],
   "guard_0_S_w0": [
    697,
    1544,
    12,
    31,
    6,
    28
   ],
   "guard_0_S_w4": [
    710,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_E_i0": [
    723,
    1544,
    10,
    31,
    5,
    28
   ],
   "noble_1_E_w1": [
    734,
    1544,
    14,
    31,
    7,
    28
   ],
   "noble_1_E_w5": [
    749,
    1544,
    14,
    31,
    7,
    28
   ],
   "noble_1_E_w6": [
    764,
    1544,
    13,
    31,
    7,
    28
   ],
   "noble_1_NE_i1": [
    778,
    1544,
    11,
    31,
    5,
    28
   ],
   "noble_1_N_i1": [
    790,
    1544,
    14,
    31,
    7,
    28
   ],
   "noble_1_SE_i0": [
    805,
    1544,
    11,
    31,
    5,
    28
   ],
   "noble_1_SE_w1": [
    817,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_SE_w2": [
    830,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_SE_w5": [
    843,
    1544,
    14,
    31,
    6,
    28
   ],
   "noble_1_SE_w6": [
    858,
    1544,
    13,
    31,
    7,
    28
   ],
   "noble_1_S_i0": [
    872,
    1544,
    14,
    31,
    7,
    28
   ],
   "noble_1_S_w0": [
    887,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_S_w1": [
    900,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_S_w2": [
    913,
    1544,
    13,
    31,
    6,
    28
   ],
   "noble_1_S_w4": [
    927,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_S_w5": [
    940,
    1544,
    12,
    31,
    6,
    28
   ],
   "noble_1_S_w6": [
    953,
    1544,
    13,
    31,
    7,
    28
   ],
   "dwarf_2_E_i0": [
    967,
    1544,
    13,
    30,
    6,
    27
   ],
   "dwarf_2_E_t0": [
    981,
    1544,
    13,
    30,
    6,
    27
   ],
   "dwarf_2_E_t1": [
    995,
    1544,
    13,
    30,
    6,
    27
   ],
   "dwarf_2_N_w3": [
    0,
    1576,
    18,
    30,
    9,
    27
   ],
   "dwarf_2_N_w7": [
    19,
    1576,
    19,
    30,
    9,
    27
   ],
   "dwarf_2_SE_i0": [
    39,
    1576,
    17,
    30,
    9,
    27
   ],
   "dwarf_2_SE_w4": [
    57,
    1576,
    21,
    30,
    10,
    26
   ],
   "elder_1_E_i0": [
    79,
    1576,
    16,
    30,
    8,
    28
   ],
   "elder_1_NE_i0": [
    96,
    1576,
    16,
    30,
    7,
    28
   ],
   "elder_1_N_i1": [
    113,
    1576,
    14,
    30,
    7,
    28
   ],
   "elder_1_SE_i0": [
    128,
    1576,
    13,
    30,
    7,
    28
   ],
   "elder_1_S_i0": [
    142,
    1576,
    14,
    30,
    7,
    28
   ],
   "guard_0_E_i1": [
    157,
    1576,
    12,
    30,
    5,
    28
   ],
   "guard_0_E_w1": [
    170,
    1576,
    13,
    30,
    5,
    29
   ],
   "guard_0_E_w2": [
    184,
    1576,
    12,
    30,
    5,
    29
   ],
   "guard_0_E_w4": [
    197,
    1576,
    12,
    30,
    5,
    28
   ],
   "guard_0_E_w5": [
    210,
    1576,
    12,
    30,
    5,
    28
   ],
   "guard_0_SE_i0": [
    223,
    1576,
    11,
    30,
    5,
    28
   ],
   "guard_0_SE_w0": [
    235,
    1576,
    11,
    30,
    5,
    28
   ],
   "guard_0_SE_w1": [
    247,
    1576,
    10,
    30,
    4,
    28
   ],
   "guard_0_SE_w3": [
    258,
    1576,
    13,
    30,
    5,
    28
   ],
   "guard_0_SE_w4": [
    272,
    1576,
    13,
    30,
    5,
    27
   ],
   "guard_0_SE_w5": [
    286,
    1576,
    12,
    30,
    5,
    28
   ],
   "guard_0_SE_w6": [
    299,
    1576,
    11,
    30,
    5,
    28
   ],
   "guard_0_S_i0": [
    311,
    1576,
    12,
    30,
    6,
    28
   ],
   "guard_0_S_w1": [
    324,
    1576,
    13,
    30,
    6,
    28
   ],
   "guard_0_S_w2": [
    338,
    1576,
    13,
    30,
    6,
    28
   ],
   "guard_0_S_w3": [
    352,
    1576,
    12,
    30,
    6,
    28
   ],
   "guard_0_S_w5": [
    365,
    1576,
    13,
    30,
    7,
    28
   ],
   "guard_0_S_w6": [
    379,
    1576,
    13,
    30,
    7,
    28
   ],
   "guard_0_S_w7": [
    393,
    1576,
    12,
    30,
    6,
    28
   ],
   "noble_1_E_i1": [
    406,
    1576,
    10,
    30,
    5,
    27
   ],
   "noble_1_SE_i1": [
    417,
    1576,
    11,
    30,
    5,
    27
   ],
   "noble_1_S_i1": [
    429,
    1576,
    14,
    30,
    7,
    27
   ],
   "dwarf_2_E_i1": [
    444,
    1576,
    13,
    29,
    6,
    26
   ],
   "dwarf_2_E_w0": [
    458,
    1576,
    14,
    29,
    6,
    26
   ],
   "dwarf_2_E_w4": [
    473,
    1576,
    14,
    29,
    6,
    26
   ],
   "dwarf_2_E_w5": [
    488,
    1576,
    14,
    29,
    6,
    26
   ],
   "dwarf_2_E_w6": [
    503,
    1576,
    14,
    29,
    6,
    26
   ],
   "dwarf_2_E_w7": [
    518,
    1576,
    14,
    29,
    6,
    26
   ],
   "dwarf_2_NE_i0": [
    533,
    1576,
    16,
    29,
    7,
    27
   ],
   "dwarf_2_NE_w0": [
    550,
    1576,
    18,
    29,
    9,
    26
   ],
   "dwarf_2_NE_w1": [
    569,
    1576,
    17,
    29,
    8,
    27
   ],
   "dwarf_2_NE_w3": [
    587,
    1576,
    15,
    29,
    7,
    27
   ],
   "dwarf_2_NE_w6": [
    603,
    1576,
    16,
    29,
    7,
    27
   ],
   "dwarf_2_NE_w7": [
    620,
    1576,
    17,
    29,
    8,
    26
   ],
   "dwarf_2_N_i0": [
    638,
    1576,
    18,
    29,
    9,
    27
   ],
   "dwarf_2_N_w0": [
    657,
    1576,
    18,
    29,
    9,
    26
   ],
   "dwarf_2_N_w1": [
    676,
    1576,
    18,
    29,
    9,
    27
   ],
   "dwarf_2_N_w2": [
    695,
    1576,
    18,
    29,
    9,
    27
   ],
   "dwarf_2_N_w4": [
    714,
    1576,
    18,
    29,
    9,
    26
   ],
   "dwarf_2_N_w5": [
    733,
    1576,
    19,
    29,
    9,
    27
   ],
   "dwarf_2_N_w6": [
    753,
    1576,
    19,
    29,
    9,
    27
   ],
   "dwarf_2_SE_i1": [
    773,
    1576,
    17,
    29,
    9,
    26
   ],
   "dwarf_2_SE_w0": [
    791,
    1576,
    16,
    29,
    8,
    26
   ],
   "dwarf_2_SE_w5": [
    808,
    1576,
    20,
    29,
    10,
    26
   ],
   "dwarf_2_SE_w6": [
    829,
    1576,
    17,
    29,
    9,
    26
   ],
   "dwarf_2_S_w0": [
    847,
    1576,
    18,
    29,
    9,
    25
   ],
   "dwarf_2_S_w1": [
    866,
    1576,
    18,
    29,
    9,
    26
   ],
   "dwarf_2_S_w4": [
    885,
    1576,
    18,
    29,
    9,
    25
   ],
   "dwarf_2_S_w5": [
    904,
    1576,
    19,
    29,
    10,
    26
   ],
   "elder_0_NE_w2": [
    924,
    1576,
    15,
    29,
    7,
    26
   ],
   "elder_0_N_w0": [
    940,
    1576,
    12,
    29,
    6,
    26
   ],
   "elder_0_N_w1": [
    953,
    1576,
    12,
    29,
    6,
    26
   ],
   "elder_0_N_w2": [
    966,
    1576,
    12,
    29,
    6,
    26
   ],
   "elder_0_N_w6": [
    979,
    1576,
    12,
    29,
    6,
    26
   ],
   "elder_0_N_w7": [
    992,
    1576,
    12,
    29,
    6,
    26
   ],
   "elder_1_E_i1": [
    1005,
    1576,
    16,
    29,
    8,
    27
   ],
   "elder_1_NE_i1": [
    0,
    1607,
    16,
    29,
    7,
    27
   ],
   "elder_1_SE_i1": [
    17,
    1607,
    13,
    29,
    7,
    27
   ],
   "elder_1_S_i1": [
    31,
    1607,
    14,
    29,
    7,
    27
   ],
   "farmer_0_E_i0": [
    46,
    1607,
    14,
    29,
    6,
    26
   ],
   "farmer_0_E_t0": [
    61,
    1607,
    14,
    29,
    6,
    26
   ],
   "farmer_0_E_t1": [
    76,
    1607,
    14,
    29,
    7,
    26
   ],
   "guard_0_E_w3": [
    91,
    1607,
    12,
    29,
    5,
    28
   ],
   "guard_0_SE_i1": [
    104,
    1607,
    11,
    29,
    5,
    27
   ],
   "guard_0_SE_w2": [
    116,
    1607,
    11,
    29,
    5,
    28
   ],
   "guard_0_SE_w7": [
    128,
    1607,
    11,
    29,
    5,
    27
   ],
   "guard_0_S_i1": [
    140,
    1607,
    12,
    29,
    6,
    27
   ],
   "noble_0_NE_w2": [
    153,
    1607,
    11,
    29,
    6,
    26
   ],
   "noble_0_NE_w6": [
    165,
    1607,
    12,
    29,
    6,
    26
   ],
   "noble_0_N_w1": [
    178,
    1607,
    11,
    29,
    6,
    26
   ],
   "noble_0_N_w2": [
    190,
    1607,
    12,
    29,
    6,
    26
   ],
   "noble_0_N_w3": [
    203,
    1607,
    12,
    29,
    6,
    26
   ],
   "noble_0_N_w5": [
    216,
    1607,
    11,
    29,
    5,
    26
   ],
   "noble_0_N_w6": [
    228,
    1607,
    12,
    29,
    6,
    26
   ],
   "noble_0_N_w7": [
    241,
    1607,
    12,
    29,
    6,
    26
   ],
   "dwarf_2_E_w1": [
    254,
    1607,
    14,
    28,
    6,
    26
   ],
   "dwarf_2_E_w3": [
    269,
    1607,
    14,
    28,
    6,
    26
   ],
   "dwarf_2_NE_i1": [
    284,
    1607,
    16,
    28,
    7,
    26
   ],
   "dwarf_2_NE_w2": [
    301,
    1607,
    16,
    28,
    7,
    27
   ],
   "dwarf_2_NE_w4": [
    318,
    1607,
    15,
    28,
    7,
    26
   ],
   "dwarf_2_NE_w5": [
    334,
    1607,
    15,
    28,
    6,
    26
   ],
   "dwarf_2_N_i1": [
    350,
    1607,
    18,
    28,
    9,
    26
   ],
   "dwarf_2_SE_w1": [
    369,
    1607,
    17,
    28,
    9,
    26
   ],
   "dwarf_2_SE_w2": [
    387,
    1607,
    17,
    28,
    9,
    26
   ],
   "dwarf_2_SE_w3": [
    405,
    1607,
    19,
    28,
    9,
    26
   ],
   "dwarf_2_SE_w7": [
    425,
    1607,
    16,
    28,
    9,
    26
   ],
   "dwarf_2_S_i0": [
    442,
    1607,
    18,
    28,
    9,
    26
   ],
   "dwarf_2_S_w2": [
    461,
    1607,
    18,
    28,
    9,
    26
   ],
   "dwarf_2_S_w3": [
    480,
    1607,
    18,
    28,
    9,
    26
   ],
   "dwarf_2_S_w6": [
    499,
    1607,
    19,
    28,
    10,
    26
   ],
   "dwarf_2_S_w7": [
    519,
    1607,
    19,
    28,
    10,
    26
   ],
   "elder_0_E_w0": [
    539,
    1607,
    16,
    28,
    8,
    25
   ],
   "elder_0_E_w1": [
    556,
    1607,
    16,
    28,
    8,
    25
   ],
   "elder_0_E_w2": [
    573,
    1607,
    15,
    28,
    8,
    25
   ],
   "elder_0_E_w3": [
    589,
    1607,
    15,
    28,
    8,
    25
   ],
   "elder_0_E_w4": [
    605,
    1607,
    15,
    28,
    8,
    25
   ],
   "elder_0_E_w5": [
    621,
    1607,
    15,
    28,
    8,
    25
   ],
   "elder_0_E_w6": [
    637,
    1607,
    15,
    28,
    8,
    25
   ],
   "elder_0_E_w7": [
    653,
    1607,
    16,
    28,
    8,
    25
   ],
   "elder_0_NE_w0": [
    670,
    1607,
    16,
    28,
    7,
    25
   ],
   "elder_0_NE_w1": [
    687,
    1607,
    17,
    28,
    8,
    25
   ],
   "elder_0_NE_w3": [
    705,
    1607,
    16,
    28,
    8,
    25
   ],
   "elder_0_NE_w4": [
    722,
    1607,
    15,
    28,
    7,
    25
   ],
   "elder_0_NE_w5": [
    738,
    1607,
    15,
    28,
    7,
    25
   ],
   "elder_0_NE_w6": [
    754,
    1607,
    16,
    28,
    7,
    25
   ],
   "elder_0_NE_w7": [
    771,
    1607,
    16,
    28,
    7,
    25
   ],
   "elder_0_N_i0": [
    788,
    1607,
    12,
    28,
    6,
    26
   ],
   "elder_0_N_w3": [
    801,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_N_w4": [
    814,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_N_w5": [
    827,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_SE_w0": [
    840,
    1607,
    13,
    28,
    7,
    25
   ],
   "elder_0_SE_w1": [
    854,
    1607,
    12,
    28,
    7,
    25
   ],
   "elder_0_SE_w2": [
    867,
    1607,
    13,
    28,
    7,
    25
   ],
   "elder_0_SE_w3": [
    881,
    1607,
    15,
    28,
    7,
    25
   ],
   "elder_0_SE_w4": [
    897,
    1607,
    15,
    28,
    7,
    25
   ],
   "elder_0_SE_w5": [
    913,
    1607,
    14,
    28,
    7,
    25
   ],
   "elder_0_SE_w6": [
    928,
    1607,
    13,
    28,
    7,
    25
   ],
   "elder_0_SE_w7": [
    942,
    1607,
    13,
    28,
    7,
    25
   ],
   "elder_0_S_w1": [
    956,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_S_w2": [
    969,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_S_w3": [
    982,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_S_w5": [
    995,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_S_w6": [
    1008,
    1607,
    12,
    28,
    6,
    25
   ],
   "elder_0_S_w7": [
    0,
    1637,
    12,
    28,
    6,
    25
   ],
   "elf_0_E_i0": [
    13,
    1637,
    11,
    28,
    7,
    26
   ],
   "elf_0_E_w6": [
    25,
    1637,
    13,
    28,
    8,
    26
   ],
   "elf_0_NE_i0": [
    39,
    1637,
    12,
    28,
    6,
    26
   ],
   "elf_0_NE_w0": [
    52,
    1637,
    15,
    28,
    7,
    26
   ],
   "elf_0_NE_w4": [
    68,
    1637,
    12,
    28,
    7,
    26
   ],
   "elf_0_NE_w6": [
    81,
    1637,
    12,
    28,
    6,
    26
   ],
   "elf_0_NE_w7": [
    94,
    1637,
    15,
    28,
    7,
    26
   ],
   "elf_0_N_w0": [
    110,
    1637,
    10,
    28,
    5,
    26
   ],
   "elf_0_N_w3": [
    121,
    1637,
    11,
    28,
    6,
    26
   ],
   "elf_0_N_w4": [
    133,
    1637,
    10,
    28,
    5,
    26
   ],
   "elf_0_N_w7": [
    144,
    1637,
    11,
    28,
    5,
    26
   ],
   "elf_0_SE_w4": [
    156,
    1637,
    15,
    28,
    7,
    25
   ],
   "elf_0_S_w0": [
    172,
    1637,
    10,
    28,
    5,
    25
   ],
   "elf_0_S_w4": [
    183,
    1637,
    10,
    28,
    5,
    25
   ],
   "farmer_0_E_i1": [
    194,
    1637,
    14,
    28,
    6,
    25
   ],
   "merchant_0_NE_w0": [
    209,
    1637,
    16,
    28,
    7,
    25
   ],
   "merchant_0_NE_w2": [
    226,
    1637,
    13,
    28,
    7,
    26
   ],
   "merchant_0_N_w0": [
    240,
    1637,
    12,
    28,
    6,
    25
   ],
   "merchant_0_N_w2": [
    253,
    1637,
    13,
    28,
    7,
    26
   ],
   "merchant_0_N_w4": [
    267,
    1637,
    12,
    28,
    6,
    25
   ],
   "merchant_0_N_w6": [
    280,
    1637,
    13,
    28,
    6,
    26
   ],
   "merchant_0_SE_w4": [
    294,
    1637,
    16,
    28,
    7,
    25
   ],
   "merchant_0_SE_w5": [
    311,
    1637,
    14,
    28,
    6,
    25
   ],
   "merchant_0_S_w0": [
    326,
    1637,
    12,
    28,
    6,
    25
   ],
   "merchant_0_S_w1": [
    339,
    1637,
    13,
    28,
    6,
    25
   ],
   "merchant_0_S_w4": [
    353,
    1637,
    12,
    28,
    6,
    25
   ],
   "merchant_0_S_w5": [
    366,
    1637,
    13,
    28,
    7,
    25
   ],
   "monk_0_E_w1": [
    380,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_E_w2": [
    393,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_E_w3": [
    406,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_E_w6": [
    419,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_NE_w0": [
    432,
    1637,
    14,
    28,
    6,
    25
   ],
   "monk_0_NE_w1": [
    447,
    1637,
    14,
    28,
    6,
    25
   ],
   "monk_0_NE_w2": [
    462,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_NE_w3": [
    475,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_NE_w4": [
    488,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_NE_w5": [
    501,
    1637,
    11,
    28,
    6,
    25
   ],
   "monk_0_NE_w6": [
    513,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_NE_w7": [
    526,
    1637,
    14,
    28,
    6,
    25
   ],
   "monk_0_N_w0": [
    541,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w1": [
    554,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w2": [
    567,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w3": [
    580,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w4": [
    593,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w5": [
    606,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w6": [
    619,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_N_w7": [
    632,
    1637,
    12,
    28,
    6,
    25
   ],
   "monk_0_SE_w2": [
    645,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_E_i0": [
    658,
    1637,
    10,
    28,
    5,
    25
   ],
   "noble_0_E_w0": [
    669,
    1637,
    13,
    28,
    6,
    25
   ],
   "noble_0_E_w1": [
    683,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_E_w2": [
    696,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_E_w3": [
    709,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_E_w4": [
    722,
    1637,
    13,
    28,
    6,
    25
   ],
   "noble_0_E_w5": [
    736,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_E_w6": [
    749,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_E_w7": [
    762,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_NE_i0": [
    775,
    1637,
    11,
    28,
    5,
    25
   ],
   "noble_0_NE_w0": [
    787,
    1637,
    14,
    28,
    6,
    25
   ],
   "noble_0_NE_w1": [
    802,
    1637,
    13,
    28,
    6,
    25
   ],
   "noble_0_NE_w3": [
    816,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_NE_w4": [
    829,
    1637,
    11,
    28,
    6,
    25
   ],
   "noble_0_NE_w5": [
    841,
    1637,
    11,
    28,
    6,
    25
   ],
   "noble_0_NE_w7": [
    853,
    1637,
    14,
    28,
    6,
    25
   ],
   "noble_0_N_i0": [
    868,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_N_w0": [
    881,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_N_w4": [
    894,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_SE_i0": [
    907,
    1637,
    11,
    28,
    5,
    25
   ],
   "noble_0_SE_w0": [
    919,
    1637,
    11,
    28,
    6,
    25
   ],
   "noble_0_SE_w1": [
    931,
    1637,
    11,
    28,
    6,
    25
   ],
   "noble_0_SE_w2": [
    943,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_SE_w3": [
    956,
    1637,
    14,
    28,
    6,
    25
   ],
   "noble_0_SE_w4": [
    971,
    1637,
    14,
    28,
    6,
    25
   ],
   "noble_0_SE_w5": [
    986,
    1637,
    13,
    28,
    6,
    25
   ],
   "noble_0_SE_w6": [
    1000,
    1637,
    11,
    28,
    6,
    25
   ],
   "noble_0_SE_w7": [
    1012,
    1637,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_i0": [
    0,
    1666,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_w0": [
    13,
    1666,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_w1": [
    26,
    1666,
    11,
    28,
    5,
    25
   ],
   "noble_0_S_w2": [
    38,
    1666,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_w3": [
    51,
    1666,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_w4": [
    64,
    1666,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_w5": [
    77,
    1666,
    11,
    28,
    6,
    25
   ],
   "noble_0_S_w6": [
    89,
    1666,
    12,
    28,
    6,
    25
   ],
   "noble_0_S_w7": [
    102,
    1666,
    12,
    28,
    6,
    25
   ],
   "peasant_0_SE_w4": [
    115,
    1666,
    14,
    28,
    6,
    25
   ],
   "peasant_0_S_w0": [
    130,
    1666,
    12,
    28,
    6,
    25
   ],
   "peasant_0_S_w4": [
    143,
    1666,
    12,
    28,
    6,
    25
   ],
   "woman_0_NE_w1": [
    156,
    1666,
    16,
    28,
    6,
    26
   ],
   "woman_0_NE_w2": [
    173,
    1666,
    15,
    28,
    6,
    26
   ],
   "woman_0_NE_w3": [
    189,
    1666,
    15,
    28,
    6,
    26
   ],
   "woman_0_NE_w6": [
    205,
    1666,
    15,
    28,
    6,
    26
   ],
   "woman_0_N_w1": [
    221,
    1666,
    14,
    28,
    6,
    26
   ],
   "woman_0_N_w2": [
    236,
    1666,
    14,
    28,
    6,
    26
   ],
   "woman_0_N_w3": [
    251,
    1666,
    14,
    28,
    6,
    26
   ],
   "woman_0_N_w5": [
    266,
    1666,
    14,
    28,
    6,
    26
   ],
   "woman_0_N_w6": [
    281,
    1666,
    14,
    28,
    6,
    26
   ],
   "woman_0_N_w7": [
    296,
    1666,
    14,
    28,
    6,
    26
   ],
   "woman_0_SE_w4": [
    311,
    1666,
    14,
    28,
    6,
    25
   ],
   "woman_0_S_w0": [
    326,
    1666,
    14,
    28,
    8,
    25
   ],
   "woman_0_S_w4": [
    341,
    1666,
    14,
    28,
    8,
    25
   ],
   "dwarf_2_E_w2": [
    356,
    1666,
    14,
    27,
    6,
    26
   ],
   "dwarf_2_S_i1": [
    371,
    1666,
    18,
    27,
    9,
    25
   ],
   "elder_0_E_i0": [
    390,
    1666,
    14,
    27,
    7,
    25
   ],
   "elder_0_NE_i0": [
    405,
    1666,
    14,
    27,
    6,
    25
   ],
   "elder_0_N_i1": [
    420,
    1666,
    12,
    27,
    6,
    25
   ],
   "elder_0_SE_i0": [
    433,
    1666,
    13,
    27,
    7,
    25
   ],
   "elder_0_S_i0": [
    447,
    1666,
    12,
    27,
    6,
    25
   ],
   "elder_0_S_w0": [
    460,
    1666,
    12,
    27,
    6,
    24
   ],
   "elder_0_S_w4": [
    473,
    1666,
    12,
    27,
    6,
    24
   ],
   "elf_0_E_i1": [
    486,
    1666,
    11,
    27,
    7,
    25
   ],
   "elf_0_E_w0": [
    498,
    1666,
    15,
    27,
    8,
    25
   ],
   "elf_0_E_w1": [
    514,
    1666,
    14,
    27,
    8,
    26
   ],
   "elf_0_E_w2": [
    529,
    1666,
    12,
    27,
    7,
    26
   ],
   "elf_0_E_w3": [
    542,
    1666,
    14,
    27,
    8,
    26
   ],
   "elf_0_E_w4": [
    557,
    1666,
    15,
    27,
    8,
    25
   ],
   "elf_0_E_w5": [
    573,
    1666,
    14,
    27,
    8,
    25
   ],
   "elf_0_E_w7": [
    588,
    1666,
    14,
    27,
    8,
    25
   ],
   "elf_0_NE_i1": [
    603,
    1666,
    12,
    27,
    6,
    25
   ],
   "elf_0_NE_w1": [
    616,
    1666,
    14,
    27,
    7,
    26
   ],
   "elf_0_NE_w2": [
    631,
    1666,
    12,
    27,
    7,
    26
   ],
   "elf_0_NE_w3": [
    644,
    1666,
    12,
    27,
    7,
    26
   ],
   "elf_0_NE_w5": [
    657,
    1666,
    12,
    27,
    7,
    26
   ],
   "elf_0_N_i0": [
    670,
    1666,
    12,
    27,
    6,
    26
   ],
   "elf_0_N_w1": [
    683,
    1666,
    11,
    27,
    6,
    26
   ],
   "elf_0_N_w2": [
    695,
    1666,
    11,
    27,
    6,
    26
   ],
   "elf_0_N_w5": [
    707,
    1666,
    11,
    27,
    5,
    26
   ],
   "elf_0_N_w6": [
    719,
    1666,
    11,
    27,
    5,
    26
   ],
   "elf_0_SE_i0": [
    731,
    1666,
    12,
    27,
    6,
    25
   ],
   "elf_0_SE_w0": [
    744,
    1666,
    12,
    27,
    7,
    25
   ],
   "elf_0_SE_w1": [
    757,
    1666,
    12,
    27,
    7,
    25
   ],
   "elf_0_SE_w5": [
    770,
    1666,
    14,
    27,
    7,
    25
   ],
   "elf_0_SE_w6": [
    785,
    1666,
    12,
    27,
    7,
    25
   ],
   "elf_0_SE_w7": [
    798,
    1666,
    12,
    27,
    7,
    25
   ],
   "elf_0_S_i0": [
    811,
    1666,
    12,
    27,
    6,
    25
   ],
   "elf_0_S_w1": [
    824,
    1666,
    11,
    27,
    5,
    25
   ],
   "elf_0_S_w2": [
    836,
    1666,
    11,
    27,
    5,
    25
   ],
   "elf_0_S_w5": [
    848,
    1666,
    11,
    27,
    6,
    25
   ],
   "elf_0_S_w6": [
    860,
    1666,
    11,
    27,
    6,
    25
   ],
   "maid_0_E_i0": [
    872,
    1666,
    10,
    27,
    5,
    25
   ],
   "maid_0_E_t0": [
    883,
    1666,
    12,
    27,
    5,
    25
   ],
   "maid_0_E_t1": [
    896,
    1666,
    12,
    27,
    5,
    25
   ],
   "merchant_0_E_i0": [
    909,
    1666,
    10,
    27,
    5,
    25
   ],
   "merchant_0_E_w0": [
    920,
    1666,
    13,
    27,
    6,
    25
   ],
   "merchant_0_E_w1": [
    934,
    1666,
    12,
    27,
    6,
    25
   ],
   "merchant_0_E_w2": [
    947,
    1666,
    13,
    27,
    7,
    25
   ],
   "merchant_0_E_w3": [
    961,
    1666,
    12,
    27,
    6,
    25
   ],
   "merchant_0_E_w4": [
    974,
    1666,
    13,
    27,
    6,
    25
   ],
   "merchant_0_E_w5": [
    988,
    1666,
    12,
    27,
    6,
    25
   ],
   "merchant_0_E_w6": [
    1001,
    1666,
    13,
    27,
    7,
    25
   ],
   "merchant_0_E_w7": [
    0,
    1695,
    14,
    27,
    7,
    25
   ],
   "merchant_0_NE_i0": [
    15,
    1695,
    11,
    27,
    5,
    25
   ],
   "merchant_0_NE_w1": [
    27,
    1695,
    14,
    27,
    6,
    25
   ],
   "merchant_0_NE_w3": [
    42,
    1695,
    13,
    27,
    7,
    25
   ],
   "merchant_0_NE_w4": [
    56,
    1695,
    12,
    27,
    6,
    25
   ],
   "merchant_0_NE_w5": [
    69,
    1695,
    12,
    27,
    6,
    25
   ],
   "merchant_0_NE_w6": [
    82,
    1695,
    12,
    27,
    6,
    25
   ],
   "merchant_0_NE_w7": [
    95,
    1695,
    14,
    27,
    6,
    25
   ],
   "merchant_0_N_i0": [
    110,
    1695,
    14,
    27,
    7,
    25
   ],
   "merchant_0_N_w1": [
    125,
    1695,
    13,
    27,
    7,
    25
   ],
   "merchant_0_N_w3": [
    139,
    1695,
    13,
    27,
    7,
    25
   ],
   "merchant_0_N_w5": [
    153,
    1695,
    13,
    27,
    6,
    25
   ],
   "merchant_0_N_w7": [
    167,
    1695,
    13,
    27,
    6,
    25
   ],
   "merchant_0_SE_i0": [
    181,
    1695,
    11,
    27,
    5,
    25
   ],
   "merchant_0_SE_w0": [
    193,
    1695,
    12,
    27,
    6,
    25
   ],
   "merchant_0_SE_w1": [
    206,
    1695,
    12,
    27,
    6,
    25
   ],
   "merchant_0_SE_w2": [
    219,
    1695,
    12,
    27,
    6,
    25
   ],
   "merchant_0_SE_w3": [
    232,
    1695,
    14,
    27,
    6,
    25
   ],
   "merchant_0_SE_w6": [
    247,
    1695,
    13,
    27,
    7,
    25
   ],
   "merchant_0_SE_w7": [
    261,
    1695,
    13,
    27,
    7,
    25
   ],
   "merchant_0_S_i0": [
    275,
    1695,
    14,
    27,
    7,
    25
   ],
   "merchant_0_S_w2": [
    290,
    1695,
    13,
    27,
    6,
    25
   ],
   "merchant_0_S_w3": [
    304,
    1695,
    13,
    27,
    6,
    25
   ],
   "merchant_0_S_w6": [
    318,
    1695,
    13,
    27,
    7,
    25
   ],
   "merchant_0_S_w7": [
    332,
    1695,
    13,
    27,
    7,
    25
   ],
   "monk_0_E_i0": [
    346,
    1695,
    10,
    27,
    5,
    25
   ],
   "monk_0_E_w0": [
    357,
    1695,
    13,
    27,
    6,
    24
   ],
   "monk_0_E_w4": [
    371,
    1695,
    13,
    27,
    6,
    24
   ],
   "monk_0_E_w5": [
    385,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_E_w7": [
    398,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_NE_i0": [
    411,
    1695,
    11,
    27,
    5,
    25
   ],
   "monk_0_N_i0": [
    423,
    1695,
    12,
    27,
    6,
    25
   ],
   "monk_0_SE_i0": [
    436,
    1695,
    11,
    27,
    5,
    25
   ],
   "monk_0_SE_w0": [
    448,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_SE_w1": [
    461,
    1695,
    11,
    27,
    6,
    24
   ],
   "monk_0_SE_w3": [
    473,
    1695,
    14,
    27,
    6,
    24
   ],
   "monk_0_SE_w4": [
    488,
    1695,
    14,
    27,
    6,
    24
   ],
   "monk_0_SE_w5": [
    503,
    1695,
    13,
    27,
    6,
    24
   ],
   "monk_0_SE_w6": [
    517,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_SE_w7": [
    530,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w0": [
    543,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w1": [
    556,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w2": [
    569,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w3": [
    582,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w4": [
    595,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w5": [
    608,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w6": [
    621,
    1695,
    12,
    27,
    6,
    24
   ],
   "monk_0_S_w7": [
    634,
    1695,
    12,
    27,
    6,
    24
   ],
   "noble_0_E_i1": [
    647,
    1695,
    10,
    27,
    5,
    24
   ],
   "noble_0_NE_i1": [
    658,
    1695,
    11,
    27,
    5,
    24
   ],
   "noble_0_N_i1": [
    670,
    1695,
    12,
    27,
    6,
    24
   ],
   "noble_0_SE_i1": [
    683,
    1695,
    11,
    27,
    5,
    24
   ],
   "noble_0_S_i1": [
    695,
    1695,
    12,
    27,
    6,
    24
   ],
   "peasant_0_E_i0": [
    708,
    1695,
    9,
    27,
    4,
    25
   ],
   "peasant_0_E_w0": [
    718,
    1695,
    12,
    27,
    5,
    25
   ],
   "peasant_0_E_w4": [
    731,
    1695,
    12,
    27,
    5,
    25
   ],
   "peasant_0_E_w5": [
    744,
    1695,
    10,
    27,
    4,
    25
   ],
   "peasant_0_E_w6": [
    755,
    1695,
    9,
    27,
    3,
    25
   ],
   "peasant_0_E_w7": [
    765,
    1695,
    10,
    27,
    4,
    25
   ],
   "peasant_0_NE_i0": [
    776,
    1695,
    11,
    27,
    5,
    25
   ],
   "peasant_0_NE_w0": [
    788,
    1695,
    14,
    27,
    6,
    25
   ],
   "peasant_0_NE_w2": [
    803,
    1695,
    10,
    27,
    4,
    26
   ],
   "peasant_0_NE_w4": [
    814,
    1695,
    11,
    27,
    5,
    25
   ],
   "peasant_0_NE_w6": [
    826,
    1695,
    10,
    27,
    4,
    25
   ],
   "peasant_0_NE_w7": [
    837,
    1695,
    13,
    27,
    5,
    25
   ],
   "peasant_0_N_i0": [
    851,
    1695,
    12,
    27,
    6,
    25
   ],
   "peasant_0_N_w0": [
    864,
    1695,
    12,
    27,
    6,
    25
   ],
   "peasant_0_N_w2": [
    877,
    1695,
    12,
    27,
    6,
    26
   ],
   "peasant_0_N_w3": [
    890,
    1695,
    12,
    27,
    6,
    25
   ],
   "peasant_0_N_w4": [
    903,
    1695,
    12,
    27,
    6,
    25
   ],
   "peasant_0_N_w6": [
    916,
    1695,
    12,
    27,
    6,
    26
   ],
   "peasant_0_N_w7": [
    929,
    1695,
    12,
    27,
    6,
    25
   ],
   "peasant_0_SE_i0": [
    942,
    1695,
    11,
    27,
    5,
    25
   ],
   "peasant_0_SE_w0": [
    954,
    1695,
    11,
    27,
    5,
    25
   ],
   "peasant_0_SE_w1": [
    966,
    1695,
    9,
    27,
    4,
    25
   ],
   "peasant_0_SE_w3": [
    976,
    1695,
    13,
    27,
    5,
    25
   ],
   "peasant_0_SE_w5": [
    990,
    1695,
    12,
    27,
    5,
    25
   ],
   "peasant_0_SE_w6": [
    1003,
    1695,
    10,
    27,
    4,
    25
   ],
   "peasant_0_SE_w7": [
    1014,
    1695,
    10,
    27,
    4,
    25
   ],
   "peasant_0_S_i0": [
    0,
    1723,
    12,
    27,
    6,
    25
   ],
   "peasant_0_S_w1": [
    13,
    1723,
    12,
    27,
    6,
    25
   ],
   "peasant_0_S_w2": [
    26,
    1723,
    12,
    27,
    6,
    25
   ],
   "peasant_0_S_w3": [
    39,
    1723,
    12,
    27,
    6,
    25
   ],
   "peasant_0_S_w5": [
    52,
    1723,
    12,
    27,
    6,
    25
   ],
   "peasant_0_S_w6": [
    65,
    1723,
    12,
    27,
    6,
    25
   ],
   "peasant_0_S_w7": [
    78,
    1723,
    12,
    27,
    6,
    25
   ],
   "woman_0_E_i0": [
    91,
    1723,
    12,
    27,
    5,
    25
   ],
   "woman_0_E_w0": [
    104,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_E_w1": [
    119,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_E_w2": [
    134,
    1723,
    13,
    27,
    6,
    25
   ],
   "woman_0_E_w3": [
    148,
    1723,
    13,
    27,
    6,
    25
   ],
   "woman_0_E_w4": [
    162,
    1723,
    13,
    27,
    6,
    25
   ],
   "woman_0_E_w5": [
    176,
    1723,
    13,
    27,
    6,
    25
   ],
   "woman_0_E_w6": [
    190,
    1723,
    13,
    27,
    6,
    25
   ],
   "woman_0_E_w7": [
    204,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_NE_i0": [
    219,
    1723,
    14,
    27,
    5,
    25
   ],
   "woman_0_NE_w0": [
    234,
    1723,
    16,
    27,
    6,
    25
   ],
   "woman_0_NE_w4": [
    251,
    1723,
    15,
    27,
    6,
    25
   ],
   "woman_0_NE_w5": [
    267,
    1723,
    15,
    27,
    6,
    25
   ],
   "woman_0_NE_w7": [
    283,
    1723,
    16,
    27,
    6,
    25
   ],
   "woman_0_N_i0": [
    300,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_N_i1": [
    315,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_N_w0": [
    330,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_N_w4": [
    345,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_SE_i0": [
    360,
    1723,
    11,
    27,
    5,
    25
   ],
   "woman_0_SE_w0": [
    372,
    1723,
    12,
    27,
    6,
    25
   ],
   "woman_0_SE_w1": [
    385,
    1723,
    11,
    27,
    6,
    25
   ],
   "woman_0_SE_w2": [
    397,
    1723,
    12,
    27,
    6,
    25
   ],
   "woman_0_SE_w3": [
    410,
    1723,
    14,
    27,
    6,
    25
   ],
   "woman_0_SE_w5": [
    425,
    1723,
    13,
    27,
    6,
    25
   ],
   "woman_0_SE_w6": [
    439,
    1723,
    12,
    27,
    6,
    25
   ],
   "woman_0_SE_w7": [
    452,
    1723,
    12,
    27,
    6,
    25
   ],
   "woman_0_S_i0": [
    465,
    1723,
    14,
    27,
    8,
    25
   ],
   "woman_0_S_w1": [
    480,
    1723,
    14,
    27,
    8,
    25
   ],
   "woman_0_S_w2": [
    495,
    1723,
    14,
    27,
    8,
    25
   ],
   "woman_0_S_w3": [
    510,
    1723,
    14,
    27,
    8,
    25
   ],
   "woman_0_S_w5": [
    525,
    1723,
    14,
    27,
    8,
    25
   ],
   "woman_0_S_w6": [
    540,
    1723,
    14,
    27,
    8,
    25
   ],
   "woman_0_S_w7": [
    555,
    1723,
    14,
    27,
    8,
    25
   ],
   "elder_0_E_i1": [
    570,
    1723,
    14,
    26,
    7,
    24
   ],
   "elder_0_NE_i1": [
    585,
    1723,
    14,
    26,
    6,
    24
   ],
   "elder_0_SE_i1": [
    600,
    1723,
    13,
    26,
    7,
    24
   ],
   "elder_0_S_i1": [
    614,
    1723,
    12,
    26,
    6,
    24
   ],
   "elf_0_N_i1": [
    627,
    1723,
    12,
    26,
    6,
    25
   ],
   "elf_0_SE_i1": [
    640,
    1723,
    12,
    26,
    6,
    24
   ],
   "elf_0_SE_w2": [
    653,
    1723,
    12,
    26,
    6,
    25
   ],
   "elf_0_SE_w3": [
    666,
    1723,
    15,
    26,
    7,
    25
   ],
   "elf_0_S_i1": [
    682,
    1723,
    12,
    26,
    6,
    24
   ],
   "elf_0_S_w3": [
    695,
    1723,
    10,
    26,
    5,
    25
   ],
   "elf_0_S_w7": [
    706,
    1723,
    10,
    26,
    5,
    25
   ],
   "maid_0_E_i1": [
    717,
    1723,
    11,
    26,
    6,
    24
   ],
   "merchant_0_E_i1": [
    729,
    1723,
    10,
    26,
    5,
    24
   ],
   "merchant_0_NE_i1": [
    740,
    1723,
    11,
    26,
    5,
    24
   ],
   "merchant_0_N_i1": [
    752,
    1723,
    14,
    26,
    7,
    24
   ],
   "merchant_0_SE_i1": [
    767,
    1723,
    11,
    26,
    5,
    24
   ],
   "merchant_0_S_i1": [
    779,
    1723,
    14,
    26,
    7,
    24
   ],
   "monk_0_E_i1": [
    794,
    1723,
    10,
    26,
    5,
    24
   ],
   "monk_0_NE_i1": [
    805,
    1723,
    11,
    26,
    5,
    24
   ],
   "monk_0_N_i1": [
    817,
    1723,
    12,
    26,
    6,
    24
   ],
   "monk_0_SE_i1": [
    830,
    1723,
    11,
    26,
    5,
    24
   ],
   "monk_0_S_i0": [
    842,
    1723,
    12,
    26,
    6,
    24
   ],
   "peasant_0_E_i1": [
    855,
    1723,
    9,
    26,
    4,
    24
   ],
   "peasant_0_E_w1": [
    865,
    1723,
    10,
    26,
    4,
    25
   ],
   "peasant_0_E_w2": [
    876,
    1723,
    8,
    26,
    3,
    25
   ],
   "peasant_0_E_w3": [
    885,
    1723,
    10,
    26,
    4,
    25
   ],
   "peasant_0_NE_i1": [
    896,
    1723,
    11,
    26,
    5,
    24
   ],
   "peasant_0_NE_w1": [
    908,
    1723,
    13,
    26,
    5,
    25
   ],
   "peasant_0_NE_w3": [
    922,
    1723,
    10,
    26,
    4,
    25
   ],
   "peasant_0_NE_w5": [
    933,
    1723,
    9,
    26,
    4,
    25
   ],
   "peasant_0_N_i1": [
    943,
    1723,
    12,
    26,
    6,
    24
   ],
   "peasant_0_N_w1": [
    956,
    1723,
    12,
    26,
    6,
    25
   ],
   "peasant_0_N_w5": [
    969,
    1723,
    12,
    26,
    6,
    25
   ],
   "peasant_0_SE_i1": [
    982,
    1723,
    11,
    26,
    5,
    24
   ],
   "peasant_0_SE_w2": [
    994,
    1723,
    10,
    26,
    4,
    25
   ],
   "peasant_0_S_i1": [
    1005,
    1723,
    12,
    26,
    6,
    24
   ],
   "woman_0_E_i1": [
    0,
    1751,
    13,
    26,
    6,
    24
   ],
   "woman_0_NE_i1": [
    14,
    1751,
    14,
    26,
    5,
    24
   ],
   "woman_0_SE_i1": [
    29,
    1751,
    11,
    26,
    5,
    24
   ],
   "woman_0_S_i1": [
    41,
    1751,
    14,
    26,
    8,
    24
   ],
   "monk_0_S_i1": [
    56,
    1751,
    12,
    25,
    6,
    23
   ]
  },
  "anchors": {
   "h_bard_e0": {
    "lute": [
     8,
     -28
    ]
   },
   "h_bard_w0": {
    "lute": [
     -8,
     -30
    ]
   },
   "h_bard_e1": {
    "lute": [
     8,
     -29
    ]
   },
   "h_bard_w1": {
    "lute": [
     -8,
     -30
    ]
   },
   "h_bard_e2": {
    "lute": [
     8,
     -29
    ]
   },
   "h_bard_w2": {
    "lute": [
     -8,
     -31
    ]
   },
   "h_bard_e3": {
    "lute": [
     8,
     -29
    ]
   },
   "h_bard_w3": {
    "lute": [
     -8,
     -30
    ]
   },
   "h_bard_e4": {
    "lute": [
     8,
     -28
    ]
   },
   "h_bard_w4": {
    "lute": [
     -8,
     -30
    ]
   },
   "h_bard_e5": {
    "lute": [
     8,
     -29
    ]
   },
   "h_bard_w5": {
    "lute": [
     -8,
     -31
    ]
   },
   "h_bard_e6": {
    "lute": [
     8,
     -29
    ]
   },
   "h_bard_w6": {
    "lute": [
     -8,
     -31
    ]
   },
   "h_bard_e7": {
    "lute": [
     8,
     -29
    ]
   },
   "h_bard_w7": {
    "lute": [
     -8,
     -31
    ]
   },
   "h_bard_p0": {
    "lute": [
     -2,
     -27
    ]
   },
   "h_bard_p1": {
    "lute": [
     -2,
     -27
    ]
   },
   "h_bard_p2": {
    "lute": [
     -2,
     -27
    ]
   },
   "h_bard_p3": {
    "lute": [
     -2,
     -27
    ]
   },
   "h_bard_se": {
    "lute": [
     4,
     -27
    ]
   },
   "h_bard_sw": {
    "lute": [
     -7,
     -28
    ]
   },
   "h_astrologer_r0": {
    "orb": [
     -4,
     -43
    ],
    "book": [
     8,
     -28
    ]
   },
   "h_astrologer_r1": {
    "orb": [
     -4,
     -41
    ],
    "book": [
     8,
     -26
    ]
   },
   "h_astrologer_f0": {
    "orb": [
     -4,
     -43
    ],
    "book": [
     8,
     -28
    ]
   },
   "h_astrologer_f1": {
    "orb": [
     -4,
     -43
    ],
    "book": [
     8,
     -28
    ]
   },
   "h_astrologer_f2": {
    "orb": [
     -4,
     -43
    ],
    "book": [
     8,
     -28
    ]
   },
   "h_astrologer_up": {
    "orb": [
     -5,
     -43
    ],
    "book": [
     6,
     -26
    ]
   },
   "h_astrologer_s0": {
    "orb": [
     -15,
     -46
    ],
    "book": [
     -1,
     -27
    ]
   },
   "h_astrologer_g0": {
    "orb": [
     -7,
     -62
    ],
    "book": [
     -1,
     -27
    ]
   },
   "h_astrologer_g1": {
    "orb": [
     -7,
     -63
    ],
    "book": [
     -1,
     -27
    ]
   },
   "h_archer_i0": {
    "tip": [
     15,
     -27
    ],
    "hand": [
     0,
     -19
    ]
   },
   "h_archer_i1": {
    "tip": [
     15,
     -26
    ],
    "hand": [
     0,
     -18
    ]
   },
   "h_archer_reach": {
    "tip": [
     15,
     -27
    ],
    "hand": [
     -6,
     -44
    ]
   },
   "h_archer_nock": {
    "tip": [
     24,
     -37
    ],
    "hand": [
     12,
     -37
    ]
   },
   "h_archer_draw1": {
    "tip": [
     25,
     -38
    ],
    "hand": [
     7,
     -38
    ]
   },
   "h_archer_draw2": {
    "tip": [
     25,
     -38
    ],
    "hand": [
     2,
     -41
    ]
   },
   "h_archer_release": {
    "tip": [
     25,
     -38
    ],
    "hand": [
     -3,
     -42
    ]
   },
   "h_archer_follow": {
    "tip": [
     25,
     -37
    ],
    "hand": [
     -4,
     -40
    ]
   },
   "h_archer_lower": {
    "tip": [
     19,
     -31
    ],
    "hand": [
     0,
     -19
    ]
   },
   "h_archer_se": {
    "tip": [
     14,
     -24
    ],
    "hand": [
     -4,
     -19
    ]
   },
   "h_archer_g0": {
    "tip": [
     5,
     -21
    ],
    "hand": [
     -10,
     -48
    ]
   },
   "h_archer_g1": {
    "tip": [
     5,
     -21
    ],
    "hand": [
     -8,
     -50
    ]
   },
   "h_mage_i0": {
    "orb": [
     13,
     -50
    ]
   },
   "h_mage_i1": {
    "orb": [
     13,
     -48
    ]
   },
   "h_mage_reach": {
    "orb": [
     16,
     -49
    ]
   },
   "h_mage_read": {
    "orb": [
     13,
     -50
    ]
   },
   "h_mage_se": {
    "orb": [
     12,
     -48
    ]
   },
   "h_mage_g0": {
    "orb": [
     6,
     -56
    ]
   },
   "h_mage_g1": {
    "orb": [
     6,
     -58
    ]
   }
  },
  "kinds": {
   "peasant": [
    0,
    2,
    3,
    4
   ],
   "woman": [
    0,
    2
   ],
   "monk": [
    0,
    2,
    3,
    4
   ],
   "merchant": [
    0,
    3
   ],
   "elf": [
    0,
    2,
    3,
    4
   ],
   "maid": [
    0,
    2,
    3,
    4
   ],
   "farmer": [
    0,
    2,
    3,
    4
   ],
   "guard": [
    0,
    1,
    2,
    3,
    4
   ],
   "noble": [
    0,
    1,
    2,
    3,
    4
   ],
   "elder": [
    0,
    1,
    2,
    3,
    4
   ],
   "baker": [
    2
   ],
   "mercenary": [
    2,
    4
   ],
   "dwarf": [
    2,
    3,
    4
   ],
   "orc": [
    2,
    3,
    4
   ],
   "hooded": [
    2,
    3,
    4
   ],
   "witch": [
    2,
    3,
    4
   ]
  },
  "colors": [
   723209,
   920588,
   1052174,
   1117978,
   1512244,
   1513262,
   1645622,
   1646175,
   1652111,
   1774869,
   1840919,
   1841454,
   1845015,
   1912147,
   1973036,
   1976132,
   1978194,
   2128046,
   2175577,
   2176340,
   2182270,
   2241870,
   2304075,
   2306592,
   2367006,
   2441762,
   2446726,
   2511235,
   2522547,
   2526144,
   2561815,
   2566469,
   2572120,
   2600918,
   2627641,
   2634836,
   2826530,
   2828071,
   2829391,
   2834794,
   2840440,
   2891810,
   2895130,
   2907955,
   2957850,
   2969134,
   3021081,
   3026253,
   3026858,
   3039403,
   3098986,
   3113895,
   3161953,
   3299690,
   3305156,
   3350622,
   3351687,
   3387860,
   3417886,
   3422053,
   3430759,
   3489649,
   3616559,
   3630469,
   3635106,
   3681580,
   3697478,
   3701329,
   3752813,
   3812400,
   3878196,
   3954325,
   3956345,
   4061129,
   4081702,
   4083342,
   4240073,
   4285583,
   4294624,
   4399912,
   4406075,
   4484283,
   4554109,
   4611008,
   4621927,
   4667712,
   4698577,
   4702171,
   4733990,
   4734012,
   4744751,
   4748979,
   4799302,
   4820121,
   4882747,
   4886133,
   4931900,
   4936577,
   5084495,
   5121828,
   5144460,
   5214124,
   5654600,
   5718572,
   5731752,
   5919571,
   5938059,
   5975476,
   6049871,
   6116941,
   6201752,
   6400168,
   6434115,
   6462877,
   6606034,
   6661238,
   6709295,
   6985416,
   7116986,
   7236446,
   7356973,
   7365216,
   7375810,
   7391692,
   7450805,
   7501965,
   7578303,
   7629156,
   7758944,
   7776424,
   7897403,
   8099149,
   8151609,
   8272486,
   8286834,
   8289408,
   8510172,
   8638677,
   9016996,
   9077627,
   9153780,
   9352130,
   9383935,
   9398585,
   9617343,
   9719180,
   9746897,
   9864313,
   9881551,
   10249636,
   10277843,
   10459027,
   10597306,
   10717507,
   10790056,
   10851149,
   11380121,
   11448429,
   11461631,
   11855076,
   11970913,
   12116192,
   12309725,
   12373197,
   12377308,
   12499895,
   12697479,
   12960697,
   13422507,
   14147808,
   14540250,
   14606041,
   14675180,
   15856884,
   16317180,
   16777215
  ],
  "scales": [
   0.62,
   0.7,
   0.78,
   0.88,
   1
  ],
  "cycle": 16.8,
  "yc": 0.3894,
  "face": {
   "S": [
    "S",
    false
   ],
   "SE": [
    "SE",
    false
   ],
   "E": [
    "E",
    false
   ],
   "NE": [
    "NE",
    false
   ],
   "N": [
    "N",
    false
   ],
   "NW": [
    "NE",
    true
   ],
   "W": [
    "E",
    true
   ],
   "SW": [
    "SE",
    true
   ]
  }
 },
 "spots": {
  "board": {
   "x": 376,
   "y": 306,
   "scale": 1.04,
   "place": "큰 계단 난간 위"
  },
  "weekly-gg": {
   "x": 288,
   "y": 478,
   "scale": 1.06,
   "place": "분수 옆 게임 소파"
  },
  "events": {
   "x": 86,
   "y": 450,
   "scale": 1.06,
   "place": "점성술 천막"
  },
  "join": {
   "x": 792,
   "y": 442,
   "scale": 1.08,
   "place": "성벽 아래 과녁장"
  },
  "showcase": {
   "x": 690,
   "y": 518,
   "scale": 1.2,
   "place": "마법 두루마리 좌판"
  },
  "about": {
   "x": 142,
   "y": 530,
   "scale": 1.12,
   "place": "화톳불 옆 벤치"
  },
  "gallery": {
   "x": 480,
   "y": 510,
   "scale": 1.12,
   "place": "분수 앞"
  }
 },
 "heroes": {
  "about": {
   "hero": "knight",
   "script": [
    [
     "h_knight_i0",
     1.8
    ],
    [
     "h_knight_i1",
     1.3
    ],
    [
     "h_knight_i0",
     1.8
    ],
    [
     "h_knight_i1",
     1.3
    ],
    [
     "h_knight_s0",
     0.12
    ],
    [
     "h_knight_sw",
     0.12
    ],
    [
     "h_knight_warm0",
     0.7
    ],
    [
     "h_knight_warm1",
     0.7
    ],
    [
     "h_knight_warm0",
     0.7
    ],
    [
     "h_knight_warm1",
     0.7
    ],
    [
     "h_knight_warm0",
     0.7
    ],
    [
     "h_knight_sw",
     0.12
    ],
    [
     "h_knight_s0",
     0.12
    ]
   ],
   "greet": [
    [
     "h_knight_s0",
     0.1
    ],
    [
     "h_knight_g0",
     0.32
    ],
    [
     "h_knight_g1",
     0.32
    ],
    [
     "h_knight_g0",
     0.32
    ],
    [
     "h_knight_g1",
     0.32
    ]
   ],
   "scale": 1.523,
   "height": 68
  },
  "gallery": {
   "hero": "bard",
   "script": [
    [
     "h_bard_p0",
     0.16
    ],
    [
     "h_bard_p1",
     0.16
    ],
    [
     "h_bard_p2",
     0.16
    ],
    [
     "h_bard_p3",
     0.16
    ]
   ],
   "greet": [
    [
     "h_bard_p0",
     0.12
    ],
    [
     "h_bard_p1",
     0.12
    ],
    [
     "h_bard_p2",
     0.12
    ],
    [
     "h_bard_p3",
     0.12
    ]
   ],
   "walk": {
    "right": [
     "h_bard_e0",
     "h_bard_e1",
     "h_bard_e2",
     "h_bard_e3",
     "h_bard_e4",
     "h_bard_e5",
     "h_bard_e6",
     "h_bard_e7"
    ],
    "left": [
     "h_bard_w0",
     "h_bard_w1",
     "h_bard_w2",
     "h_bard_w3",
     "h_bard_w4",
     "h_bard_w5",
     "h_bard_w6",
     "h_bard_w7"
    ],
    "speed": 24,
    "span": [
     -80,
     80
    ],
    "rest": 3.2,
    "cycle": 25.59,
    "turnL": "h_bard_sw",
    "turnR": "h_bard_se"
   },
   "scale": 1.523,
   "height": 68
  },
  "events": {
   "hero": "astrologer",
   "script": [
    [
     "h_astrologer_r0",
     1.6
    ],
    [
     "h_astrologer_r1",
     1.2
    ],
    [
     "h_astrologer_r0",
     1.4
    ],
    [
     "h_astrologer_f0",
     0.14
    ],
    [
     "h_astrologer_f1",
     0.14
    ],
    [
     "h_astrologer_f2",
     0.18
    ],
    [
     "h_astrologer_r0",
     1.2
    ],
    [
     "h_astrologer_r1",
     1.2
    ],
    [
     "h_astrologer_up",
     1.8
    ],
    [
     "h_astrologer_r0",
     0.8
    ]
   ],
   "greet": [
    [
     "h_astrologer_s0",
     0.1
    ],
    [
     "h_astrologer_g0",
     0.5
    ],
    [
     "h_astrologer_g1",
     0.5
    ]
   ],
   "scale": 1.442,
   "height": 65
  },
  "join": {
   "hero": "archer",
   "script": [
    [
     "h_archer_i0",
     0.9
    ],
    [
     "h_archer_i1",
     0.7
    ],
    [
     "h_archer_reach",
     0.36
    ],
    [
     "h_archer_nock",
     0.3
    ],
    [
     "h_archer_draw1",
     0.22
    ],
    [
     "h_archer_draw2",
     0.8
    ],
    [
     "h_archer_release",
     0.14
    ],
    [
     "h_archer_follow",
     0.5
    ],
    [
     "h_archer_lower",
     0.34
    ]
   ],
   "greet": [
    [
     "h_archer_se",
     0.1
    ],
    [
     "h_archer_g0",
     0.32
    ],
    [
     "h_archer_g1",
     0.32
    ],
    [
     "h_archer_g0",
     0.32
    ],
    [
     "h_archer_g1",
     0.32
    ]
   ],
   "scale": 1.469,
   "height": 66
  },
  "showcase": {
   "hero": "mage",
   "script": [
    [
     "h_mage_i0",
     1.4
    ],
    [
     "h_mage_i1",
     1.1
    ],
    [
     "h_mage_i0",
     1.4
    ],
    [
     "h_mage_reach",
     0.5
    ],
    [
     "h_mage_read",
     2.4
    ],
    [
     "h_mage_reach",
     0.4
    ],
    [
     "h_mage_i0",
     1
    ],
    [
     "h_mage_i1",
     1.1
    ]
   ],
   "greet": [
    [
     "h_mage_se",
     0.1
    ],
    [
     "h_mage_g0",
     0.45
    ],
    [
     "h_mage_g1",
     0.45
    ]
   ],
   "scale": 1.632,
   "height": 73
  },
  "board": {
   "hero": "rogue",
   "script": [
    [
     "h_rogue_i0",
     1.5
    ],
    [
     "h_rogue_i1",
     1
    ],
    [
     "h_rogue_lookL",
     1.2
    ],
    [
     "h_rogue_i0",
     0.4
    ],
    [
     "h_rogue_lookR",
     1.2
    ],
    [
     "h_rogue_i0",
     1
    ],
    [
     "h_rogue_i1",
     1
    ],
    [
     "h_rogue_t0",
     0.18
    ],
    [
     "h_rogue_t1",
     0.12
    ],
    [
     "h_rogue_t2",
     0.2
    ],
    [
     "h_rogue_t3",
     0.12
    ],
    [
     "h_rogue_t0",
     0.3
    ]
   ],
   "greet": [
    [
     "h_rogue_s0",
     0.1
    ],
    [
     "h_rogue_g0",
     0.7
    ],
    [
     "h_rogue_g1",
     0.5
    ]
   ],
   "scale": 1.414,
   "height": 49
  },
  "weekly-gg": {
   "hero": "woowang",
   "script": [
    [
     "h_woowang_idle",
     0.5
    ],
    [
     "h_woowang_press",
     0.18
    ],
    [
     "h_woowang_idle",
     0.34
    ],
    [
     "h_woowang_press",
     0.14
    ],
    [
     "h_woowang_idle",
     0.22
    ],
    [
     "h_woowang_press",
     0.14
    ],
    [
     "h_woowang_idle",
     0.9
    ],
    [
     "h_woowang_press",
     0.2
    ]
   ],
   "greet": [
    [
     "h_woowang_press",
     0.12
    ],
    [
     "h_woowang_idle",
     0.12
    ]
   ],
   "scale": 1,
   "height": 62,
   "sortY": 487,
   "noShadow": true
  }
 },
 "clock": [
  480,
  176,
  17
 ],
 "flag": [
  481,
  26
 ],
 "smoke": [
  [
   79,
   140
  ],
  [
   124,
   142
  ],
  [
   243,
   142
  ],
  [
   330,
   166
  ],
  [
   750,
   137
  ],
  [
   649,
   161
  ]
 ],
 "fall": [
  586,
  176
 ],
 "fires": [
  [
   366,
   371
  ],
  [
   594,
   371
  ],
  [
   84,
   487
  ]
 ],
 "screen": {
  "x": 181,
  "y": 434,
  "w": 29,
  "h": 25
 },
 "bull": [
  890,
  394
 ],
 "statue": {
  "x": 480,
  "baseY": 412
 },
 "twinkles": [
  [
   124,
   364
  ],
  [
   172,
   358
  ],
  [
   144,
   346
  ],
  [
   184,
   382
  ],
  [
   112,
   386
  ],
  [
   158,
   378
  ],
  [
   134,
   388
  ]
 ],
 "phases": {
  "dawn": {
   "lamps": 0.8,
   "leaves": [
    "#874420",
    "#7d412f",
    "#a87721",
    "#9e6c3d"
   ],
   "hand": "#2b1d12",
   "smoke": "#c4a5b4",
   "shadow": 0.24,
   "stars": [
    [
     53,
     41
    ],
    [
     783,
     62
    ],
    [
     383,
     8
    ],
    [
     6,
     29
    ],
    [
     373,
     42
    ],
    [
     594,
     6
    ],
    [
     206,
     6
    ],
    [
     772,
     20
    ],
    [
     523,
     2
    ],
    [
     602,
     31
    ],
    [
     198,
     5
    ],
    [
     117,
     21
    ],
    [
     619,
     97
    ],
    [
     513,
     15
    ],
    [
     701,
     35
    ],
    [
     252,
     90
    ],
    [
     543,
     20
    ],
    [
     840,
     15
    ]
   ],
   "people": [
    1248012,
    1445134,
    1576463,
    1642263,
    2101801,
    2102309,
    2234411,
    2234953,
    2239347,
    2364180,
    2429973,
    2430501,
    2432790,
    2499650,
    2561828,
    2563894,
    2565441,
    2712220,
    2762823,
    2763331,
    2767977,
    2828607,
    2891835,
    2893340,
    2955546,
    3027486,
    3031921,
    3096686,
    3106723,
    3110067,
    3150869,
    3154231,
    3158344,
    3184850,
    3216685,
    3221827,
    3414813,
    3415841,
    3416895,
    3421015,
    3425381,
    3480093,
    3482392,
    3491885,
    3546136,
    3554088,
    3610135,
    3613757,
    3614602,
    3624597,
    3684696,
    3697816,
    3748175,
    3884634,
    3890096,
    3939145,
    3940203,
    3971793,
    4005659,
    4009042,
    4015703,
    4076124,
    4203815,
    4214899,
    4219281,
    4268837,
    4281149,
    4284232,
    4339034,
    4399912,
    4465451,
    4539775,
    4541032,
    4711127,
    4732450,
    4734584,
    4889286,
    4935805,
    4944852,
    5053730,
    5058097,
    5134760,
    5203312,
    5262249,
    5270365,
    5319733,
    5348047,
    5351902,
    5385761,
    5385778,
    5393962,
    5398946,
    5451322,
    5469069,
    5530678,
    5534571,
    5583410,
    5587566,
    5732169,
    5775135,
    5793663,
    5863329,
    6305853,
    6369830,
    6381720,
    6570311,
    6586755,
    6629013,
    6700611,
    6767426,
    6850449,
    7049123,
    7087159,
    7111829,
    7255768,
    7374960,
    7424554,
    7700672,
    7831986,
    7951699,
    8074023,
    8080724,
    8091320,
    8106961,
    8165554,
    8217216,
    8293306,
    8344408,
    8474452,
    8491171,
    8611127,
    8812616,
    8866867,
    8990548,
    9002086,
    9004404,
    9226217,
    9354462,
    9731996,
    9792369,
    9870072,
    10132930,
    10169055,
    10179124,
    10398146,
    10502009,
    10527956,
    10644592,
    10662870,
    11031444,
    11059422,
    11239308,
    11378106,
    11497023,
    11570596,
    11630409,
    12160405,
    12227691,
    12244735,
    12637431,
    12815710,
    12964081,
    13157355,
    13220310,
    13224940,
    13346234,
    13543048,
    13807294,
    14268850,
    14995955,
    15388139,
    15519467,
    15589631,
    16771839,
    16773887,
    16775679
   ]
  },
  "morning": {
   "lamps": 0,
   "leaves": [
    "#b96c26",
    "#ac6838",
    "#d5af26",
    "#cba148"
   ],
   "hand": "#271c13",
   "smoke": "#e7e1ce",
   "shadow": 0.24,
   "stars": [],
   "people": [
    788744,
    986123,
    1117453,
    1183256,
    1577520,
    1578538,
    1710898,
    1711448,
    1651847,
    1840147,
    1906197,
    1906730,
    1910293,
    1977421,
    2038312,
    2041407,
    2043468,
    2127785,
    2240851,
    2241614,
    2247543,
    2307145,
    2369350,
    2371870,
    2432284,
    2506784,
    2446208,
    2576252,
    2522286,
    2525884,
    2692629,
    2631744,
    2637138,
    2535381,
    2692916,
    2700110,
    2957343,
    2893348,
    2894665,
    2900068,
    2905458,
    3022623,
    3025944,
    2972976,
    3088664,
    3034155,
    3151895,
    3091528,
    3092129,
    3039141,
    3164004,
    3113634,
    3227227,
    3364709,
    3304894,
    3415895,
    3416958,
    3322323,
    3548700,
    3487327,
    3495778,
    3554922,
    3747372,
    3629951,
    3634845,
    3812393,
    3762498,
    3766349,
    3818087,
    3943212,
    4009008,
    4019598,
    4021363,
    3930572,
    4212259,
    4148615,
    4174536,
    4285321,
    4228829,
    4530725,
    4536631,
    4484021,
    4553593,
    4610745,
    4621411,
    4798524,
    4633040,
    4571355,
    4864547,
    4864568,
    4809772,
    4748718,
    4930113,
    4819861,
    4947768,
    4885873,
    5062456,
    5001851,
    5083980,
    5318177,
    5144200,
    5148328,
    5785156,
    5849129,
    5731491,
    6050127,
    5872264,
    6040747,
    6180427,
    6247497,
    6135957,
    6334630,
    6630462,
    6397082,
    6409683,
    6595443,
    6839852,
    6919878,
    7051447,
    7301466,
    7553066,
    7430236,
    7310015,
    7195341,
    7319732,
    7501705,
    7447229,
    7694176,
    7823964,
    7645350,
    7962425,
    8098635,
    8282166,
    8403296,
    8352110,
    8289148,
    8248543,
    8377047,
    8951201,
    9077367,
    8957429,
    9155522,
    9383670,
    9529142,
    9420991,
    9784454,
    9485010,
    9864054,
    9619665,
    10249375,
    9950678,
    10393232,
    10400698,
    10782529,
    10658982,
    10850891,
    11249047,
    11317099,
    11003647,
    11397097,
    11839583,
    11658213,
    11917025,
    11980495,
    11919072,
    12238007,
    12435334,
    12633274,
    13095084,
    13624293,
    14016735,
    14082526,
    14086387,
    15137020,
    15532031,
    15925247
   ]
  },
  "noon": {
   "lamps": 0,
   "leaves": [
    "#bf6d26",
    "#b26938",
    "#d6af27",
    "#cda149"
   ],
   "hand": "#2b1d12",
   "smoke": "#e2ded6",
   "shadow": 0.24,
   "stars": [],
   "people": [
    723209,
    920588,
    1052174,
    1117978,
    1512244,
    1513262,
    1645622,
    1646175,
    1652111,
    1774869,
    1840919,
    1841454,
    1845015,
    1912147,
    1973036,
    1976132,
    1978194,
    2128046,
    2175577,
    2176340,
    2182270,
    2241870,
    2304075,
    2306592,
    2367006,
    2441762,
    2446726,
    2511235,
    2522547,
    2526144,
    2561815,
    2566469,
    2572120,
    2600918,
    2627641,
    2634836,
    2826530,
    2828071,
    2829391,
    2834794,
    2840440,
    2891810,
    2895130,
    2907955,
    2957850,
    2969134,
    3021081,
    3026253,
    3026858,
    3039403,
    3098986,
    3113895,
    3161953,
    3299690,
    3305156,
    3350622,
    3351687,
    3387860,
    3417886,
    3422053,
    3430759,
    3489649,
    3616559,
    3630469,
    3635106,
    3681580,
    3697478,
    3701329,
    3752813,
    3812400,
    3878196,
    3954325,
    3956345,
    4061129,
    4081702,
    4083342,
    4240073,
    4285583,
    4294624,
    4399912,
    4406075,
    4484283,
    4554109,
    4611008,
    4621927,
    4667712,
    4698577,
    4702171,
    4733990,
    4734012,
    4744751,
    4748979,
    4799302,
    4820121,
    4882747,
    4886133,
    4931900,
    4936577,
    5084495,
    5121828,
    5144460,
    5214124,
    5654600,
    5718572,
    5731752,
    5919571,
    5938059,
    5975476,
    6049871,
    6116941,
    6201752,
    6400168,
    6434115,
    6462877,
    6606034,
    6661238,
    6709295,
    6985416,
    7116986,
    7236446,
    7356973,
    7365216,
    7375810,
    7391692,
    7450805,
    7501965,
    7578303,
    7629156,
    7758944,
    7776424,
    7897403,
    8099149,
    8151609,
    8272486,
    8286834,
    8289408,
    8510172,
    8638677,
    9016996,
    9077627,
    9153780,
    9352130,
    9383935,
    9398585,
    9617343,
    9719180,
    9746897,
    9864313,
    9881551,
    10249636,
    10277843,
    10459027,
    10597306,
    10717507,
    10790056,
    10851149,
    11380121,
    11448429,
    11461631,
    11855076,
    11970913,
    12116192,
    12309725,
    12373197,
    12377308,
    12499895,
    12697479,
    12960697,
    13422507,
    14147808,
    14540250,
    14606041,
    14675180,
    15856884,
    16317180,
    16777215
   ]
  },
  "afternoon": {
   "lamps": 0,
   "leaves": [
    "#bd6321",
    "#af5f31",
    "#dba422",
    "#d0963f"
   ],
   "hand": "#281910",
   "smoke": "#efd6b6",
   "shadow": 0.24,
   "stars": [],
   "people": [
    657416,
    854539,
    986125,
    1051928,
    1380400,
    1381418,
    1513522,
    1514073,
    1453960,
    1643027,
    1709077,
    1643818,
    1646869,
    1713998,
    1775401,
    1778239,
    1780045,
    1863084,
    1977428,
    1977935,
    1917817,
    2043465,
    2106182,
    2108190,
    2169372,
    2177312,
    2182274,
    2246782,
    2192050,
    2195648,
    2364437,
    2303040,
    2307923,
    2270427,
    2364725,
    2370895,
    2563103,
    2564644,
    2565706,
    2570597,
    2510196,
    2628383,
    2631448,
    2577457,
    2694424,
    2638892,
    2757911,
    2762568,
    2697891,
    2709416,
    2769253,
    2717862,
    2832220,
    2969446,
    2909378,
    3021912,
    3022976,
    2926297,
    3088924,
    3092576,
    3034979,
    3094636,
    3287340,
    3234690,
    3173536,
    3352361,
    3301187,
    3304783,
    3357544,
    3483181,
    3483441,
    3493265,
    3495029,
    3468499,
    3686180,
    3622537,
    3647181,
    3824268,
    3767778,
    4005413,
    3945272,
    3957433,
    4026747,
    4084413,
    4094309,
    4207164,
    4040406,
    4044002,
    4273188,
    4273209,
    4217389,
    4156594,
    4338754,
    4227224,
    4355129,
    4292980,
    4405561,
    4409981,
    4491086,
    4661793,
    4551562,
    4555692,
    5062469,
    5126698,
    5073830,
    5261904,
    5213835,
    5318830,
    5392204,
    5459018,
    5412249,
    5545130,
    5777215,
    5673374,
    5685722,
    5805942,
    5985581,
    6065099,
    6196668,
    6447195,
    6634027,
    6576221,
    6455491,
    6340307,
    6464697,
    6581643,
    6592450,
    6774369,
    6904413,
    6790314,
    6976570,
    7112524,
    7296823,
    7418721,
    7300976,
    7303551,
    7262438,
    7390942,
    7834533,
    7960442,
    7906044,
    8104135,
    8268795,
    8347191,
    8303813,
    8603016,
    8368088,
    8681592,
    8502743,
    9002146,
    8767964,
    9145236,
    9152703,
    9468994,
    9345451,
    9537100,
    9869723,
    10003310,
    9755647,
    10083313,
    10460257,
    10344428,
    10537960,
    10601174,
    10540008,
    10793149,
    10990474,
    11122880,
    11519154,
    12048621,
    12375270,
    12441061,
    12445179,
    13364991,
    13759743,
    14088959
   ]
  },
  "evening": {
   "lamps": 0.9,
   "leaves": [
    "#9c411a",
    "#903e26",
    "#c07119",
    "#b5672f"
   ],
   "hand": "#2b1d12",
   "smoke": "#de9c81",
   "shadow": 0.24,
   "stars": [
    [
     53,
     41
    ],
    [
     783,
     62
    ],
    [
     383,
     8
    ],
    [
     6,
     29
    ],
    [
     373,
     42
    ],
    [
     594,
     6
    ],
    [
     206,
     6
    ],
    [
     772,
     20
    ],
    [
     523,
     2
    ],
    [
     602,
     31
    ],
    [
     198,
     5
    ],
    [
     117,
     21
    ],
    [
     619,
     97
    ]
   ],
   "people": [
    1182477,
    1379599,
    1510929,
    1511194,
    1904943,
    1905707,
    1972018,
    1972565,
    1976710,
    2167318,
    2167576,
    2168107,
    2170136,
    2237004,
    2299433,
    2301502,
    2237260,
    2252212,
    2434642,
    2435150,
    2374009,
    2500425,
    2563909,
    2565152,
    2627614,
    2699043,
    2572419,
    2637183,
    2580923,
    2584269,
    2822936,
    2826048,
    2764627,
    2527472,
    2888756,
    2828110,
    3086881,
    3022374,
    3023177,
    2961508,
    2900341,
    3152161,
    3088667,
    3032116,
    3152411,
    3094574,
    3282202,
    3154503,
    3089824,
    3033772,
    3159653,
    3040943,
    3288924,
    3293800,
    3233483,
    3480149,
    3415420,
    3183343,
    3611934,
    3483998,
    3424869,
    3551083,
    3744557,
    3558533,
    3497127,
    3809834,
    3690055,
    3627603,
    3748456,
    3875118,
    3940913,
    3817875,
    3884664,
    3528691,
    4076583,
    3947402,
    3838690,
    4082832,
    3960307,
    4463399,
    4401977,
    4216001,
    4284289,
    4343747,
    4351339,
    4598333,
    4166380,
    4104444,
    4664102,
    4664378,
    4606513,
    4414650,
    4729923,
    4418978,
    4611902,
    4550011,
    4796474,
    4669310,
    4682068,
    5053988,
    4743825,
    4682168,
    5387590,
    5517356,
    5200815,
    5586257,
    5274262,
    5579948,
    5716813,
    5717836,
    5472422,
    5605562,
    6169151,
    5668267,
    5549558,
    5865856,
    6243889,
    6060764,
    6192076,
    6574175,
    6959149,
    6703456,
    6385874,
    6138606,
    6328523,
    6643091,
    6456532,
    6901605,
    7031649,
    6654138,
    7102526,
    7172691,
    7489594,
    7613538,
    7362421,
    7299205,
    6864383,
    7058172,
    7698611,
    7955842,
    7508735,
    7771613,
    8268031,
    8473915,
    7905501,
    8665995,
    7970034,
    8545920,
    8038899,
    8933290,
    8238843,
    8878240,
    8689108,
    9332808,
    9012923,
    9400659,
    9471658,
    9604474,
    8899583,
    9227007,
    10061419,
    9487871,
    9681407,
    9875443,
    9683455,
    10132948,
    10395034,
    10397144,
    10727626,
    10929919,
    11256831,
    11322623,
    11195647,
    11919103,
    12117759,
    12381439
   ]
  },
  "night": {
   "lamps": 1,
   "leaves": [
    "#3d291a",
    "#382726",
    "#4d4b1d",
    "#494436"
   ],
   "hand": "#2b1d12",
   "smoke": "#5c6baf",
   "shadow": 0.34,
   "stars": [
    [
     53,
     41
    ],
    [
     783,
     62
    ],
    [
     383,
     8
    ],
    [
     6,
     29
    ],
    [
     373,
     42
    ],
    [
     594,
     6
    ],
    [
     206,
     6
    ],
    [
     772,
     20
    ],
    [
     523,
     2
    ],
    [
     602,
     31
    ],
    [
     198,
     5
    ],
    [
     117,
     21
    ],
    [
     619,
     97
    ],
    [
     513,
     15
    ],
    [
     701,
     35
    ],
    [
     252,
     90
    ],
    [
     543,
     20
    ],
    [
     840,
     15
    ],
    [
     786,
     36
    ],
    [
     452,
     3
    ],
    [
     320,
     6
    ],
    [
     925,
     15
    ],
    [
     301,
     42
    ],
    [
     613,
     16
    ],
    [
     257,
     6
    ],
    [
     152,
     38
    ],
    [
     290,
     106
    ],
    [
     306,
     57
    ],
    [
     112,
     53
    ],
    [
     45,
     98
    ],
    [
     652,
     58
    ],
    [
     329,
     95
    ],
    [
     656,
     32
    ],
    [
     792,
     3
    ],
    [
     537,
     27
    ],
    [
     14,
     46
    ],
    [
     609,
     110
    ],
    [
     127,
     77
    ],
    [
     112,
     18
    ],
    [
     51,
     20
    ],
    [
     419,
     14
    ],
    [
     423,
     28
    ],
    [
     955,
     109
    ],
    [
     464,
     49
    ],
    [
     337,
     78
    ],
    [
     662,
     2
    ]
   ],
   "people": [
    985352,
    1116681,
    1247754,
    1248013,
    1575956,
    1576467,
    1642517,
    1708323,
    1776438,
    1707276,
    1772812,
    1773075,
    1774348,
    1906207,
    1904402,
    1905690,
    1971999,
    2309450,
    2103586,
    2103840,
    2237745,
    2169374,
    2167837,
    2168847,
    2166798,
    2301456,
    2435637,
    2500660,
    2638157,
    2705749,
    2231564,
    2364699,
    2432546,
    2908772,
    2362902,
    2431264,
    2494736,
    2495249,
    2561566,
    2695209,
    2763312,
    2494736,
    2561550,
    2698263,
    2560269,
    2696213,
    2559501,
    2692638,
    2824512,
    3027270,
    2892586,
    3163208,
    2891302,
    3091243,
    3291475,
    2953763,
    3019825,
    3629924,
    2888463,
    3087143,
    3222314,
    3153708,
    3086100,
    3420727,
    3554629,
    3151379,
    3420702,
    3488291,
    3350826,
    3216916,
    3282454,
    3681084,
    3681841,
    4494696,
    3481874,
    3745592,
    4416351,
    4010555,
    4344164,
    3609106,
    3742744,
    4274255,
    4275766,
    4337487,
    4342317,
    3939098,
    4809571,
    4943466,
    3939346,
    4004889,
    4140822,
    4537677,
    4070428,
    4671811,
    4406555,
    4606004,
    4136729,
    4401460,
    4737572,
    4133905,
    4800828,
    5065805,
    4792862,
    4726548,
    5323848,
    5056546,
    5656895,
    5183813,
    5121569,
    5253408,
    5985861,
    6249294,
    5183259,
    6181959,
    6780776,
    6313270,
    5647638,
    6771292,
    6837077,
    6304808,
    5971732,
    6369320,
    7031639,
    7501157,
    7299670,
    6831421,
    7362905,
    6632234,
    6697257,
    7494734,
    6897180,
    7293476,
    6893082,
    6823208,
    7354673,
    7487288,
    8815472,
    8813419,
    8474955,
    8209206,
    9135223,
    9200989,
    8330087,
    7942682,
    9530973,
    8333113,
    9661286,
    8864822,
    9925991,
    9123142,
    10452587,
    9720131,
    10315098,
    9389087,
    10246735,
    9652772,
    10705480,
    10640948,
    12029575,
    12291448,
    11032878,
    12487029,
    12550258,
    12417384,
    12682866,
    12217178,
    12151618,
    12808540,
    13269334,
    14584694,
    14911602,
    14977394,
    15439231,
    16752006,
    16753548,
    16754831
   ]
  }
 }
} as const;

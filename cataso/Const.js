var Const = function () { }

Const.Sound = function () { }
Const.Sound.BELL = 0;
Const.Sound.BUILD = 1;
Const.Sound.CHAT = 2;
Const.Sound.DICE = 3;
Const.Sound.ENDING = 4;
Const.Sound.GET = 5;
Const.Sound.JOIN = 6;
Const.Sound.OPENING = 7;
Const.Sound.PASS = 8;
Const.Sound.ROBBER = 9;

Const.Index = function () { }
Const.Index.NONE = -1;

Const.Option = function () { }
Const.Option.ALPHABET_SETUP = 0;
Const.Option.RANDOM_SETUP = 1;

Const.State = function () { }
Const.State.READY = 0;
Const.State.PLAYING = 1;

Const.Phase = function () { }
Const.Phase.NONE = -1;
Const.Phase.SETUP_SETTLEMENT1 = 0;
Const.Phase.SETUP_ROAD1 = 1;
Const.Phase.SETUP_SETTLEMENT2 = 2;
Const.Phase.SETUP_ROAD2 = 3;
Const.Phase.DICE = 4;
Const.Phase.BURST = 5;
Const.Phase.ROBBER1 = 6;
Const.Phase.ROBBER2 = 7;
Const.Phase.MAIN = 8;
Const.Phase.BUILD_ROAD = 9;
Const.Phase.BUILD_SETTLEMENT = 10;
Const.Phase.BUILD_CITY = 11;
Const.Phase.DOMESTIC_TRADE1 = 12;
Const.Phase.DOMESTIC_TRADE2 = 13;
Const.Phase.INTERNATIONAL_TRADE = 14;
Const.Phase.SOLDIER1 = 15;
Const.Phase.SOLDIER2 = 16;
Const.Phase.ROAD_BUILDING1 = 17;
Const.Phase.ROAD_BUILDING2 = 18;
Const.Phase.YEAR_OF_PLENTY1 = 19;
Const.Phase.YEAR_OF_PLENTY2 = 20;
Const.Phase.MONOPOLY = 21;

Const.Land = function () { }
Const.Land.DESERT = -1;

Const.Resource = function () { }
Const.Resource.BRICK = 0;
Const.Resource.WOOL = 1;
Const.Resource.ORE = 2;
Const.Resource.GRAIN = 3;
Const.Resource.LUMBER = 4;

Const.SettlementRank = function () { }
Const.SettlementRank.NONE = 0x0000;
Const.SettlementRank.SETTLEMENT = 0x0100;
Const.SettlementRank.CITY = 0x0200;

Const.Card = function () { }
Const.Card.SOLDIER = 0;
Const.Card.VICTORY_POINT = 1;
Const.Card.ROAD_BUILDING = 2;
Const.Card.YEAR_OF_PLENTY = 3;
Const.Card.MONOPOLY = 4;

Const.Harbor = function () { }
Const.Harbor.GENERIC = 0;
Const.Harbor.BRICK = 1;
Const.Harbor.WOOL = 2;
Const.Harbor.ORE = 3;
Const.Harbor.GRAIN = 4;
Const.Harbor.LUMBER = 5;

Const.FONT_COLOR = [
      'red'
    , 'dodgerblue'
    , 'yellow'
    , 'lime'
];

Const.COLOR_NAME = [
      '赤'
    , '青'
    , '黄'
    , '緑'
];

Const.RESOURCE_NAME = [
      '土'
    , '羊'
    , '鉄'
    , '麦'
    , '木'
];

Const.ALPHABET_CHIP = [
      5     // A
    , 2     // B
    , 6     // C
    , 3     // D
    , 8     // E
    , 10    // F
    , 9     // G
    , 12    // H
    , 11    // i
    , 4     // J
    , 8     // K
    , 10    // L
    , 9     // M
    , 4     // N
    , 5     // O
    , 6     // P
    , 3     // Q
    , 11    // R
];

Const.ALPHABET_SIGNPOST = [
      [0, 3, 7, 12, 16, 17, 18, 15, 11, 6, 2, 1, 4, 8, 13, 14, 10, 5, 9]
    , [7, 12, 16, 17, 18, 15, 11, 6, 2, 1, 0, 3, 8, 13, 14, 10, 5, 4, 9]
    , [16, 17, 18, 15, 11, 6, 2, 1, 0, 3, 7, 12, 13, 14, 10, 5, 4, 8, 9]
    , [18, 15, 11, 6, 2, 1, 0, 3, 7, 12, 16, 17, 14, 10, 5, 4, 8, 13, 9]
    , [11, 6, 2, 1, 0, 3, 7, 12, 16, 17, 18, 15, 10, 5, 4, 8, 13, 14, 9]
    , [2, 1, 0, 3, 7, 12, 16, 17, 18, 15, 11, 6, 5, 4, 8, 13, 14, 10, 9]
];

Const.SETTLEMENT_LINK = [
      [0, 6]        // 0
    , [0, 1]        // 1
    , [1, 2, 7]     // 2
    , [2, 3]        // 3
    , [3, 4, 8]     // 4
    , [4, 5]        // 5
    , [5, 9]        // 6
    , [10, 18]      // 7
    , [6, 10, 11]   // 8
    , [11, 12, 19]  // 9
    , [7, 12, 13]   // 10
    , [13, 14, 20]  // 11
    , [8, 14, 15]   // 12
    , [15, 16, 21]  // 13
    , [9, 16, 17]   // 14
    , [17, 22]      // 15
    , [23, 33]      // 16
    , [18, 23, 24]  // 17
    , [24, 25, 34]  // 18
    , [19, 25, 26]  // 19
    , [26, 27, 35]  // 20
    , [20, 27, 28]  // 21
    , [28, 29, 36]  // 22
    , [21, 29, 30]  // 23
    , [30, 31, 37]  // 24
    , [22, 31, 32]  // 25
    , [32, 38]      // 26
    , [33, 39]      // 27
    , [39, 40, 49]  // 28
    , [34, 40, 41]  // 29
    , [41, 42, 50]  // 30
    , [35, 42, 43]  // 31
    , [43, 44, 51]  // 32
    , [36, 44, 45]  // 33
    , [45, 46, 52]  // 34
    , [37, 46, 47]  // 35
    , [47, 48, 53]  // 36
    , [38, 48]      // 37
    , [49, 54]      // 38
    , [54, 55, 62]  // 39
    , [50, 55, 56]  // 40
    , [56, 57, 63]  // 41
    , [51, 57, 58]  // 42
    , [58, 59, 64]  // 43
    , [52, 59, 60]  // 44
    , [60, 61, 65]  // 45
    , [53, 61]      // 46
    , [62, 66]      // 47
    , [66, 67]      // 48
    , [63, 67, 68]  // 49
    , [68, 69]      // 50
    , [64, 69, 70]  // 51
    , [70, 71]      // 52
    , [65, 71]      // 53
];

Const.ROAD_LINK = [
      [1, 0]    // 0
    , [1, 2]    // 1
    , [2, 3]    // 2
    , [3, 4]    // 3
    , [4, 5]    // 4
    , [5, 6]    // 5
    , [0, 8]    // 6
    , [2, 10]   // 7
    , [4, 12]   // 8
    , [6, 14]   // 9
    , [7, 8]    // 10
    , [8, 9]    // 11
    , [9, 10]   // 12
    , [10, 11]  // 13
    , [11, 12]  // 14
    , [12, 13]  // 15
    , [13, 14]  // 16
    , [14, 15]  // 17
    , [7, 17]   // 18
    , [9, 19]   // 19
    , [11, 21]  // 20
    , [13, 23]  // 21
    , [15, 25]  // 22
    , [16, 17]  // 23
    , [17, 18]  // 24
    , [18, 19]  // 25
    , [19, 20]  // 26
    , [20, 21]  // 27
    , [21, 22]  // 28
    , [22, 23]  // 29
    , [23, 24]  // 30
    , [24, 25]  // 31
    , [25, 26]  // 32
    , [16, 27]  // 33
    , [18, 29]  // 34
    , [20, 31]  // 35
    , [22, 33]  // 36
    , [24, 35]  // 37
    , [26, 37]  // 38
    , [27, 28]  // 39
    , [28, 29]  // 40
    , [29, 30]  // 41
    , [30, 31]  // 42
    , [31, 32]  // 43
    , [32, 33]  // 44
    , [33, 34]  // 45
    , [34, 35]  // 46
    , [35, 36]  // 47
    , [36, 37]  // 48
    , [28, 38]  // 49
    , [30, 40]  // 50
    , [32, 42]  // 51
    , [34, 44]  // 52
    , [36, 46]  // 53
    , [38, 39]  // 54
    , [39, 40]  // 55
    , [40, 41]  // 56
    , [41, 42]  // 57
    , [42, 43]  // 58
    , [43, 44]  // 59
    , [44, 45]  // 60
    , [45, 46]  // 61
    , [39, 47]  // 62
    , [41, 49]  // 63
    , [43, 51]  // 64
    , [45, 53]  // 65
    , [47, 48]  // 66
    , [48, 49]  // 67
    , [49, 50]  // 68
    , [50, 51]  // 69
    , [51, 52]  // 70
    , [52, 53]  // 71
];

Const.LAND_LINK = [
      [0, 1, 2, 8, 9, 10]       // 0
    , [2, 3, 4, 10, 11, 12]     // 1
    , [4, 5, 6, 12, 13, 14]     // 2
    , [7, 8, 9, 17, 18, 19]     // 3
    , [9, 10, 11, 19, 20, 21]   // 4
    , [11, 12, 13, 21, 22, 23]  // 5
    , [13, 14, 15, 23, 24, 25]  // 6
    , [16, 17, 18, 27, 28, 29]  // 7
    , [18, 19, 20, 29, 30, 31]  // 8
    , [20, 21, 22, 31, 32, 33]  // 9
    , [22, 23, 24, 33, 34, 35]  // 10
    , [24, 25, 26, 35, 36, 37]  // 11
    , [28, 29, 30, 38, 39, 40]  // 12
    , [30, 31, 32, 40, 41, 42]  // 13
    , [32, 33, 34, 42, 43, 44]  // 14
    , [34, 35, 36, 44, 45, 46]  // 15
    , [39, 40, 41, 47, 48, 49]  // 16
    , [41, 42, 43, 49, 50, 51]  // 17
    , [43, 44, 45, 51, 52, 53]  // 18
];

module.exports = Const;
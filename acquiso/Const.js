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

Const.State = function () { }
Const.State.READY = 0;
Const.State.PLAYING = 1;

Const.Phase = function () { }
Const.Phase.NONE = -1;
Const.Phase.PLAY = 0;
Const.Phase.CHAIN = 1;
Const.Phase.ABSORB = 2;
Const.Phase.MERGE = 3;
Const.Phase.SELL = 4;
Const.Phase.TRADE = 5;
Const.Phase.BUY = 6;

Const.HotelChain = function () { }
Const.HotelChain.NONE = -1;

Const.Position = function () { }
Const.Position.NONE = -1;

Const.Rotation = function () { }
Const.Rotation.NONE = 0;
Const.Rotation.HORIZONTAL = 1;
Const.Rotation.VERTICAL = 2;

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

Const.HOTEL_CHAIN_NAME = [
      'タワー'
    , 'ロクサー'
    , 'アメリカン'
    , 'ワールドワイド'
    , 'フェスティバル'
    , 'インペリアル'
    , 'コンチネンタル'
];

Const.TILE_NAME = [
      'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'
    , 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12'
    , 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12'
    , 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12'
    , 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12'
    , 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    , 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'
    , 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12'
    , 'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10', 'I11', 'I12'
];

Const.STOCK_PRICE = [
      [200, 300, 400, 500, 600, 700, 800, 900, 1000]
    , [200, 300, 400, 500, 600, 700, 800, 900, 1000]
    , [300, 400, 500, 600, 700, 800, 900, 1000, 1100]
    , [300, 400, 500, 600, 700, 800, 900, 1000, 1100]
    , [300, 400, 500, 600, 700, 800, 900, 1000, 1100]
    , [400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
    , [400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
];

Const.MAJORITY_BONUS = [
      [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
    , [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
    , [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]
    , [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]
    , [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]
    , [4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]
    , [4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]
];

Const.MINORITY_BONUS = [
      [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
    , [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
    , [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500]
    , [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500]
    , [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500]
    , [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000]
    , [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000]
];

module.exports = Const;
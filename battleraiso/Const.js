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

Const.State = function () { }
Const.State.READY = 0;
Const.State.PLAYING = 1;

Const.Index = function () { }
Const.Index.NONE = -1;

Const.Phase = function () { }
Const.Phase.NONE = -1;
Const.Phase.MAIN = 0;
Const.Phase.COMMON = 1;
Const.Phase.FOG = 2;
Const.Phase.MUD = 3;
Const.Phase.SCOUT1 = 4;
Const.Phase.SCOUT2 = 5;
Const.Phase.SCOUT3 = 6;
Const.Phase.REDEPLOY1 = 7;
Const.Phase.REDEPLOY2 = 8;
Const.Phase.DESERTER = 9;
Const.Phase.TRAITOR1 = 10;
Const.Phase.TRAITOR2 = 11;
Const.Phase.DRAW = 12;

Const.Tactics = function () { }
Const.Tactics.ALEXANDER = 0x0600;
Const.Tactics.DARIUS = 0x0601;
Const.Tactics.COMPANION = 0x0602;
Const.Tactics.SHIELD = 0x0603;
Const.Tactics.FOG = 0x0604;
Const.Tactics.MUD = 0x0605;
Const.Tactics.SCOUT = 0x0606;
Const.Tactics.REDEPLOY = 0x0607;
Const.Tactics.DESERTER = 0x0608;
Const.Tactics.TRAITOR = 0x0609;

Const.FONT_COLOR = [
      'yellow'
    , 'lime'
];

Const.COLOR_NAME = [
      '黄'
    , '緑'
];

module.exports = Const;

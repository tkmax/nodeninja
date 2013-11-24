var WebSocketServer = require('ws').Server
   , http = require('http')
   , server = http.createServer()
   , crypto = require('crypto')
   , Instance = require('./Instance')
   , BattleRaiso = require('./battleraiso/BattleRaiso')
   , Cataso = require('./cataso/Cataso')
   , AyatsuriNingen = require('./ayatsuriningen/AyatsuriNingen')
   , Xors = require('./Xors');

Xors.seed(918237);

var instanceList = [
      new BattleRaiso()
    , new BattleRaiso()
    , new BattleRaiso()
    , new BattleRaiso()
    , new AyatsuriNingen()
    , new AyatsuriNingen()
    , new AyatsuriNingen()
    , new AyatsuriNingen()
    , new Cataso()
    , new Cataso()
    , new Cataso()
    , new Cataso()
];

var User = function (ws, uid, trip) {
    this.ws = ws;
    this.uid = uid;
    this.trip = trip;
}

var splitSyntax1 = function (src) {
    return src.substring(1);
}

var sendUserList = function (instanceIdx, ws) {
    var result = '', i;

    for (i = 0; i < instanceList[instanceIdx].userList.length; i++) {
        if (i > 0) result += ' ';
        if (instanceList[instanceIdx].userList[i].trip !== '')
            result += instanceList[instanceIdx].userList[i].uid + '%' + instanceList[instanceIdx].userList[i].trip;
        else
            result += instanceList[instanceIdx].userList[i].uid;
    }

    try {
        ws.send('A' + result);
    } catch (e) {
    }
}

var createTrip = function (src) {
    var cipher, crypted;
    while (src.length < 8) src += 'H';
    cipher = crypto.createCipher('des-ecb', src.substr(0, 3));
    crypted = cipher.update(src.substr(0, 8), 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted.substr(0, 10);
}

var login = function (instanceIdx, ws, msg) {
    var tmp, uid, src, user, trip, i, isSuccessful, result;

    tmp = (splitSyntax1(msg)).split('#', 2);
    uid = tmp[0];
    if (tmp.length > 1) src = tmp[1];

    if (
        uid.length > 0
        && uid !== 'UNKNOWN'
        && uid.match(/^[0-9A-Za-z]{1,12}$/)
    ) {
        user = null;
        for (i = 0; i < instanceList[instanceIdx].userList.length; i++) {
            if (uid === instanceList[instanceIdx].userList[i].uid) {
                user = instanceList[instanceIdx].userList[i];
                break;
            }
        }
        if (user === null)
            isSuccessful = true;
        else
            isSuccessful = false;
    }
    if (isSuccessful) {
        try {
            if (src)
                trip = createTrip(src);
            else
                trip = '';
            if (trip !== '')
                ws.send('B' + uid + '%' + trip);
            else
                ws.send('B' + uid);
            sendUserList(instanceIdx, ws);
            user = new User(ws, uid, trip);
            instanceList[instanceIdx].userList.push(user);
            if (user.trip !== '')
                instanceList[instanceIdx]._broadcast('D' + user.uid + '%' + user.trip);
            else
                instanceList[instanceIdx]._broadcast('D' + user.uid);

            if (instanceList[instanceIdx].ctrlr !== null) {
                console.log(instanceList[instanceIdx].ctrlr.uid);
                ws.send('I' + instanceList[instanceIdx].ctrlr.uid);
            }
        } catch (e) {
        }
    } else {
        try {
            ws.send('C');
        } catch (e) {
        }
    }
}

var wss = new WebSocketServer({server:server});

wss.on('connection', function (ws) {

    ws.on('close', function (msg) {
        var instanceIdx, i, user = null;

        for (instanceIdx = 0; instanceIdx < instanceList.length; instanceIdx++) {
            for (i = 0; i < instanceList[instanceIdx].userList.length; i++) {
                if (ws === instanceList[instanceIdx].userList[i].ws) {
                    user = instanceList[instanceIdx].userList[i];
                    instanceList[instanceIdx].removeUser(user);
                    break;
                }
            }
            if (user !== null) break;
        }
    });

    ws.on('message', function (msg) {
        var instanceIdx = msg.charCodeAt(0), user = null, i, result, option;

        msg = msg.substring(1);

        if (instanceIdx === 100) {
            result = [];
            for (i = 0; i < instanceList.length; i++)
                result.push({ index: parseInt(i), title: instanceList[i].title, count: instanceList[i].userList.length });
            try {
                ws.send(String.fromCharCode(0) + JSON.stringify(result));
            } catch (e) {
            }
            return;
        } else if (instanceIdx >= instanceList.length || msg.length === 0) {
            return;
        }

        for (i in instanceList[instanceIdx].userList) {
            if (ws === instanceList[instanceIdx].userList[i].ws) {
                user = instanceList[instanceIdx].userList[i];
                break;
            }
        }

        if (user === null) user = new User(ws, 'UNKNOWN');

        if (user.uid === 'UNKNOWN') {
            switch (msg[0]) {
                case 'a':
                    sendUserList(instanceIdx, ws);
                    break;
                case 'b':
                    login(instanceIdx, ws, msg);
                    break;
            }
        } else {
            switch (msg[0]) {
                case 'c':
                    option = splitSyntax1(msg);
                    instanceList[instanceIdx].onChat(user, option);
                    if (option.length > 1 && option[0] === '/')
                        instanceList[instanceIdx].onCommand(user, option.split(' '));
                    break;
                case 'd':
                    option = splitSyntax1(msg);
                    instanceList[instanceIdx].onMessage(user.uid, option);
                    break;
            }
        }
    });
});

server.listen(7911);

process.on('uncaughtException', function (e) {
     console.log('uncaughtException => ' + e);
});
var WebSocketServer = require('ws').Server
   , http = require('http')
   , Instance = require('./Instance')
   , Youtube = require('./youtube/Youtube')
   , BattleRaiso = require('./battleraiso/BattleRaiso')
   , Cataso = require('./cataso/Cataso')
   , Puppeteer = require('./puppeteer/Puppeteer')
   , crypto = require('crypto')
   , server = http.createServer();

var instanceList = [
    new Youtube()
    , new Youtube()
    , new Puppeteer()
    , new Puppeteer()
    , new BattleRaiso()
    , new BattleRaiso()
    , new Cataso()
    , new Cataso()
];

var User = function (ws, uid, trip) {
    this.ws = ws;
    this.uid = uid;
    this.trip = trip;
}

var splitForSyntax1 = function (src) {
    return src.substring(1);
}

var splitForSyntax2 = function (src) {
    var result = /^([^ ]*) ?(.*)$/.exec(src.substring(1));
    result.shift();
    return result;
}

var sendUserList = function (instanceIdx, ws) {
    var result = '', i;

    for (i in instanceList[instanceIdx].userList) {
        if (i !== '0') result += ' ';
        if (instanceList[instanceIdx].userList[i].trip !== '') {
            result += instanceList[instanceIdx].userList[i].uid + '%' + instanceList[instanceIdx].userList[i].trip;
        } else {
            result += instanceList[instanceIdx].userList[i].uid;
        }
    }

    try {
        ws.send('B' + result);
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
    var tmp, uid, src = null, user, trip = '', i, isSuccessful = false, result;

    tmp = (splitForSyntax1(msg)).split('#', 2);
    uid = tmp[0];
    if (tmp.length > 1) src = tmp[1];

    if (uid.length > 0
    && uid !== 'UNKNOWN'
    && uid.match(/^[0-9A-Za-z]{1,12}$/)
    ) {
        user = null;
        for (i in instanceList[instanceIdx].userList) {
            if (uid === instanceList[instanceIdx].userList[i].uid) {
                user = instanceList[instanceIdx].userList[i];
                break;
            }
        }
        if (user === null) isSuccessful = true;
    }
    if (isSuccessful) {
        try {
            if (src !== null) trip = createTrip(src);
            if (trip !== '') {
                ws.send('C' + uid + '%' + trip);
            } else {
                ws.send('C' + uid);
            }
            sendUserList(instanceIdx, ws);
            user = new User(ws, uid, trip);
            instanceList[instanceIdx].userList.push(user);
            if (user.trip !== '') {
                instanceList[instanceIdx]._broadcast('E' + user.uid + '%' + user.trip);
            } else {
                instanceList[instanceIdx]._broadcast('E' + user.uid);
            }
            if (instanceList[instanceIdx].ctrlr === null) {
                instanceList[instanceIdx].ctrlr = user;
            }
            if (instanceList[instanceIdx].ctrlr.trip !== '') {
                instanceList[instanceIdx]._unicast(user, 'I' + instanceList[instanceIdx].ctrlr.uid + '%' + instanceList[instanceIdx].ctrlr.trip);
            } else {
                instanceList[instanceIdx]._unicast(user, 'I' + instanceList[instanceIdx].ctrlr.uid);
            }
        } catch (e) {
        }
    } else {
        try {
            ws.send('D');
        } catch (e) {
        }
    }
}

var wss = new WebSocketServer({server:server});

wss.on('connection', function (ws) {

    ws.on('close', function (msg) {
        var instanceIdx, i, user = null;

        for (instanceIdx in instanceList) {
            for (i in instanceList[instanceIdx].userList) {
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

        if (instanceIdx >= instanceList.length || msg.length === 0) return;

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
                    result = [];
                    for (i in instanceList) {
                        result.push({index:parseInt(i), title:instanceList[i].title, count:instanceList[i].userList.length});
                    }
                    try {
                        ws.send('A' + JSON.stringify(result));
                    } catch (e) {
                    }
                    break;
                case 'b':
                    sendUserList(instanceIdx, ws);
                    break;
                case 'c':
                    login(instanceIdx, ws, msg);
                    break;
            }
        } else {
            switch (msg[0]) {
                case 'd':
                    instanceList[instanceIdx]._broadcast('G' + user.uid);
                    break;
                case 'e':
                    option = splitForSyntax1(msg);
                    instanceList[instanceIdx]._broadcast('H' + user.uid + ' ' + (option.split('<').join('&lt;')).split('>').join('&gt;'));
                    if (option[0] === '/' && option.length > 1) {
                        instanceList[instanceIdx].onCommand(user.uid, option.split(' '));
                    }
                    break;
                case 'f':
                    option = splitForSyntax1(msg);
                    instanceList[instanceIdx].onMessage(user.uid, option);
                    break;
            }
        }
    });

});

server.listen(7911);

/**
process.on('uncaughtException', function (e) {
     console.log('uncaughtException => ' + e);
});
**/
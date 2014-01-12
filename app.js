var WebSocketServer = require('ws').Server
   , http = require('http')
   , server = http.createServer()
   , crypto = require('crypto')
   , Cataso = require('./cataso/Cataso');

//

var roomList = [
      new Cataso()
    , new Cataso()
    , new Cataso()
    , new Cataso()
    , new Cataso()
    , new Cataso()
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

var sendUserList = function (roomIdx, ws) {
    var result = '', i;

    for (i = 0; i < roomList[roomIdx].userList.length; i++) {
        if (i > 0) result += ' ';
        if (roomList[roomIdx].userList[i].trip !== '')
            result += roomList[roomIdx].userList[i].uid + '%' + roomList[roomIdx].userList[i].trip;
        else
            result += roomList[roomIdx].userList[i].uid;
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

var login = function (roomIdx, ws, msg) {
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
        for (i = 0; i < roomList[roomIdx].userList.length; i++) {
            if (uid === roomList[roomIdx].userList[i].uid) {
                user = roomList[roomIdx].userList[i];
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
            sendUserList(roomIdx, ws);
            user = new User(ws, uid, trip);
            roomList[roomIdx].userList.push(user);
            if (user.trip !== '')
                roomList[roomIdx]._broadcast('D' + user.uid + '%' + user.trip);
            else
                roomList[roomIdx]._broadcast('D' + user.uid);

            if (roomList[roomIdx].ctrlr !== null) {
                console.log(roomList[roomIdx].ctrlr.uid);
                ws.send('I' + roomList[roomIdx].ctrlr.uid);
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
        var roomIdx, i, user = null;

        for (roomIdx = 0; roomIdx < roomList.length; roomIdx++) {
            for (i = 0; i < roomList[roomIdx].userList.length; i++) {
                if (ws === roomList[roomIdx].userList[i].ws) {
                    user = roomList[roomIdx].userList[i];
                    roomList[roomIdx].removeUser(user);
                    break;
                }
            }
            if (user !== null) break;
        }
    });

    ws.on('message', function (msg) {
        var roomIdx = msg.charCodeAt(0), user = null, i, result, option;

        msg = msg.substring(1);

        if (roomIdx === 100) {
            result = String.fromCharCode(100);
            for (i = 0; i < roomList.length; i++) {
                result += roomList[i].userList.length + ' ';
                if (roomList[i].isPlaying)
                    result += 'p';
                else
                    result += 'r';
                if (i < roomList.length - 1) result += ' ';
            }
            try {
                ws.send(result);
            } catch (e) {
            }
            return;
        } else if (roomIdx >= roomList.length || msg.length === 0) {
            return;
        }

        for (i in roomList[roomIdx].userList) {
            if (ws === roomList[roomIdx].userList[i].ws) {
                user = roomList[roomIdx].userList[i];
                break;
            }
        }

        if (user === null) user = new User(ws, 'UNKNOWN');

        if (user.uid === 'UNKNOWN') {
            switch (msg[0]) {
                case 'a':
                    sendUserList(roomIdx, ws);
                    break;
                case 'b':
                    login(roomIdx, ws, msg);
                    break;
            }
        } else {
            switch (msg[0]) {
                case 'c':
                    option = splitSyntax1(msg);
                    roomList[roomIdx].onChat(user, option);
                    if (option.length > 1 && option[0] === '/')
                        roomList[roomIdx].onCommand(user, option.split(' '));
                    break;
                case 'd':
                    option = splitSyntax1(msg);
                    roomList[roomIdx].onMessage(user.uid, option);
                    break;
            }
        }
    });
});

server.listen(7911);

process.on('uncaughtException', function (e) {
     console.log('uncaughtException => ' + e);
});
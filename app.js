// app.js
var INSTANCE_SIZE = 9;

var Pair = function(key, value) {
  this.key = key;
  this.value = value;
}

var User = function(ws, name) {
  this.ws = ws;
  this.name = name;
}

var Controller = function() {
  this.user = null;
  this.isApproved = false;
  this.receivedMessagePool = [];
  this.sentMessagePool = [];
  this.receivedJsonPool = [];
}

var Instance = function() {
  this.userList = [];
  this.jsonStorage = [];
  this.controller = new Controller();
}

var instanceList = [];

do {
  instanceList.push(new Instance());
} while(INSTANCE_SIZE--);

var splitForSyntax1 = function(source) {
  return source.substring(1);
}

var splitForSyntax2 = function(source) {
  var tmp = /^([^ ]*) ?(.*)$/.exec(source.substring(1));
  tmp.shift();
  return tmp;
}

var broadcast = function(instanceIndex, msg) {
  var i;
  for(i in instanceList[instanceIndex].userList) {
    instanceList[instanceIndex].userList[i].ws.send(msg);
  }
}

var sendController = function(instanceIndex, msg) {
  instanceList[instanceIndex].controller.receivedMessagePool.push(msg);
  if(instanceList[instanceIndex].controller.isApproved
  && instanceList[instanceIndex].controller.receivedMessagePool.length === 1
  ) {
    instanceList[instanceIndex].controller.user.ws.send(
      instanceList[instanceIndex].controller.receivedMessagePool[0]
    );
  }
}

var sendJsonStorage = function(instanceIndex, user) {
  var i;
  instanceList[instanceIndex].controller.user = user;
  for(i in instanceList[instanceIndex].jsonStorage) {
    user.ws.send(
      'H' + instanceList[instanceIndex].jsonStorage[i].key
       + ' ' + instanceList[instanceIndex].jsonStorage[i].value
    );
  }
  user.ws.send('I');
}

var sendUserList = function(instanceIndex, ws) {
  var result = '', i;
  for(i in instanceList[instanceIndex].userList) {
    if(i !== '0') {
      result = result + ' ';
    }
    result = result + instanceList[instanceIndex].userList[i].name;
  }
  ws.send('A' + result);
}

var login = function(instanceIndex, ws, msg) {
  var name = splitForSyntax1(msg), user, i, isSuccessful = false, result;
  if(name.length > 0
    && name.match(/^[0-9A-Za-z]{1,12}$/)
    && name !== 'ALL'
    && name !== 'UNKNOWN'
  ) {
    user = null;
    for(i in instanceList[instanceIndex].userList) {
      if(name === instanceList[instanceIndex].userList[i].name) {
        user = instanceList[instanceIndex].userList[i];
        break;
      }
    }
    if(user === null) {
      isSuccessful = true;
    }
  }
  if(isSuccessful) {
    ws.send('B' + name);
    sendUserList(instanceIndex, ws);
    user = new User(ws, name);
    instanceList[instanceIndex].userList.push(user);
    broadcast(instanceIndex, 'D' + user.name);
    sendController(instanceIndex, 'P' + user.name);
    if(instanceList[instanceIndex].controller.user === null) {
      sendJsonStorage(instanceIndex, user);
    }
  } else {
    ws.send('C');
  }
}

var saveJson = function(instanceIndex, msg) {
  var option, pair;
  option = splitForSyntax2(msg);
  pair = new Pair(option[0], option[1]);
  instanceList[instanceIndex].controller.receivedJsonPool.push(pair);
}

var commit = function(instanceIndex) {
  var i, j, isSaved, msg, option, user;
  
  instanceList[instanceIndex].jsonStorage
  = instanceList[instanceIndex].controller.receivedJsonPool;
  
  for(i in instanceList[instanceIndex].controller.sentMessagePool) {
    msg = instanceList[instanceIndex].controller.sentMessagePool[i];
    switch(msg[0]) {
      case 'k':
        option = splitForSyntax2(msg);
        user = null;
        for(j in instanceList[instanceIndex].userList) {
          if(option[0] === instanceList[instanceIndex].userList[j].name) {
            user = instanceList[instanceIndex].userList[j];
            break;
          }
        }
        if(user !== null) {
          user.ws.send('L' + option[1]);
        }
      break;
      case 'l':
        option = splitForSyntax1(msg);
        broadcast(instanceIndex, 'L' + option);
      break;
      case 'm':
        option = splitForSyntax1(msg);
        broadcast(instanceIndex, 'F@');
      break;
      case 'n':
        option = splitForSyntax1(msg);
        broadcast(instanceIndex, 'G@ ' + option);
      break;
    }
  }
  
  instanceList[instanceIndex].controller.receivedMessagePool.splice(0, 1);
  
  if(instanceList[instanceIndex].controller.receivedMessagePool.length > 0) {
    instanceList[instanceIndex].controller.user.ws.send(
      instanceList[instanceIndex].controller.receivedMessagePool[0]
    );
  }
}

var WebSocketServer = require('ws').Server
   ,http            = require('http')
   ,server          = http.createServer();

var wss = new WebSocketServer({server:server});
wss.on('connection', function(ws) {
  ws.on('close', function(msg) {
    var instanceIndex, i, user = null;
    
    for(instanceIndex in instanceList) {
      for(i in instanceList[instanceIndex].userList) {
        if(ws === instanceList[instanceIndex].userList[i].ws) {
          user = instanceList[instanceIndex].userList[i];
          instanceList[instanceIndex].userList.splice(i, 1);
          broadcast(instanceIndex, 'E' + user.name);
          break;
        }
      }
      if(user !== null) break;
    }
    
    if(user !== null) {
      if(user.name === instanceList[instanceIndex].controller.user.name) {
        instanceList[instanceIndex].controller.user = null;
        instanceList[instanceIndex].controller.isApproved = false;
      }
      sendController(instanceIndex, 'Q' + user.name);
      if(instanceList[instanceIndex].controller.user === null
      && instanceList[instanceIndex].userList.length > 0
      ){
        sendJsonStorage(instanceIndex, instanceList[instanceIndex].userList[0]);
      }
    }
  });
  
  ws.on('message', function(msg) {
    var instanceIndex = msg[0], user = null, i, result, option;
    msg = msg.substring(1);
    
    if(instanceIndex >= instanceList.length || msg.length === 0) return;
    
    for(i in instanceList[instanceIndex].userList) {
      if(ws === instanceList[instanceIndex].userList[i].ws) {
        user = instanceList[instanceIndex].userList[i];
        break;
      }
    }
    
    if(user === null) {
      user = new User(ws, 'UNKNOWN');
    }
    
    if(user.name === 'UNKNOWN') {
      switch(msg[0]) {
        case 'a':
          sendUserList(instanceIndex, ws);
        break;
        case 'b':
          login(instanceIndex, ws, msg);
        break;
      }
    } else {
      switch(msg[0]) {
        case 'c':
          if(instanceList[instanceIndex].controller.isApproved) {
            user.ws.send('J' + instanceList[instanceIndex].controller.user.name);
          }
        break;
        case 'd':
          broadcast(instanceIndex, 'F' + user.name);
          sendController(instanceIndex, 'N' + user.name);
        break;
        case 'e':
          option = splitForSyntax1(msg);
          broadcast(instanceIndex, 'G' + user.name + ' ' + option);
          sendController(instanceIndex, 'O' + user.name + ' ' + option);
        break;
        case 'f':
          saveJson(instanceIndex, msg);
        break;
        case 'g':
          instanceList[instanceIndex].controller.isApproved = true;
          broadcast(instanceIndex, 'J' + user.name);
          sendController(instanceIndex, 'M' + user.name);
          if(instanceList[instanceIndex].controller.receivedMessagePool.length > 0) {
            instanceList[instanceIndex].controller.user.ws.send(
              instanceList[instanceIndex].controller.receivedMessagePool[0]
            );
          }
        break;
        case 'h':
          instanceList[instanceIndex].controller.sentMessagePool.length = 0;
          instanceList[instanceIndex].controller.receivedJsonPool.length = 0;
        break;
        case 'j':
          option = splitForSyntax1(msg);
          sendController(instanceIndex, 'K' + user.name + ' ' + option);
        break;
        case 'i':
          commit(instanceIndex);
        break;
        case 'k':
        case 'l':
        case 'm':
        case 'n':
          instanceList[instanceIndex].controller.sentMessagePool.push(msg);
        break;
      }
    }
  });
});

server.listen(443);
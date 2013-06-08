//app.js
var INSTANCE_SIZE = 1;

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

var broadcast = function(instanceIndex, msg) {
	var i;
	for(i in instanceList[instanceIndex].userList) {
		instanceList[instanceIndex].userList[i].ws.send(msg);
	}
}

var splictForSyntax1 = function(source) {
	return source.substring(1);
}

var splictForSyntax2 = function(source) {
	var tmp = /^([^ ]*) ?(.*)$/.exec(source.substring(1));
	tmp.shift();
	return tmp;
}

var login = function(instanceIndex, ws, msg) {
	var name = splictForSyntax1(msg), user, i, isSuccessful = false, result;
	if(
		name.length > 0
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
		ws.send('b' + name);
		result = '';
		for(i in instanceList[instanceIndex].userList) {
			if(i !== '0') {
				result = result + ' ';
			}
			result = result + instanceList[instanceIndex].userList[i].name;
		}
		ws.send('x' + result);
		user = new User(ws, name);
		instanceList[instanceIndex].userList.push(user);
		broadcast(instanceIndex, 'c' + user.name);
		if(instanceList[instanceIndex].controller.user === null) {
			instanceList[instanceIndex].controller.user = user;
			for(i in instanceList[instanceIndex].jsonStorage) {
				user.ws.send(
					'h' + instanceList[instanceIndex].jsonStorage[i].key
					+ ' ' + instanceList[instanceIndex].jsonStorage[i].value
				);
			}
			user.ws.send('i');
		}
	} else {
		ws.send('d');
	}
}

var saveJson = function(instanceIndex, msg) {
	var option, pair;
	option = splictForSyntax2(msg);
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
			case 'p':
				option = splictForSyntax2(msg);
				user = null;
				for(j in instanceList[instanceIndex].userList) {
					if(option[0] === instanceList[instanceIndex].userList[j].name) {
						user = instanceList[instanceIndex].userList[j];
						break;
					}
				}
				if(user !== null) {
					user.ws.send('r' + option[1]);
				}
			break;
			case 'q':
				option = splictForSyntax1(msg);
				broadcast(instanceIndex, 'r' + option);
			break;
			case 's':
				option = splictForSyntax1(msg);
				broadcast(instanceIndex, 'g@ ' + option);
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
	 ,http						= require('http')
	 ,server					= http.createServer();

var wss = new WebSocketServer({server:server});
wss.on('connection', function(ws) {
	ws.on('close', function(msg) {
		var instanceIndex, i, user = null;
		
		for(instanceIndex in instanceList) {
			for(i in instanceList[instanceIndex].userList) {
				if(ws === instanceList[instanceIndex].userList[i].ws) {
					user = instanceList[instanceIndex].userList[i];
					instanceList[instanceIndex].userList.splice(i, 1);
					broadcast(instanceIndex, 'e' + user.name);
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
			instanceList[instanceIndex].controller.receivedMessagePool.push('u' + user.name);
			if(
				instanceList[instanceIndex].controller.isApproved
				&&
				instanceList[instanceIndex].controller.receivedMessagePool.length === 1
			) {
				instanceList[instanceIndex].controller.user.ws.send(
					instanceList[instanceIndex].controller.receivedMessagePool[0]
				);
			}
			if(
				instanceList[instanceIndex].controller.user === null
				&&
				instanceList[instanceIndex].userList.length > 0
			){
				instanceList[instanceIndex].controller.user = instanceList[instanceIndex].userList[0];
				for(i in instanceList[instanceIndex].jsonStorage) {
					instanceList[instanceIndex].userList[0].ws.send(
						'h' + instanceList[instanceIndex].jsonStorage[i].key
						+ ' ' + instanceList[instanceIndex].jsonStorage[i].value
					);
				}
				instanceList[instanceIndex].userList[0].ws.send('i');
			}
		}
	});
	ws.on('message', function(msg) {
		var instanceIndex = msg.charCodeAt(0), user = null, i, result, option;
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
					login(instanceIndex, ws, msg);
				break;
				case 'w':
					if(instanceList[instanceIndex].userList.length > 0) {
						result = '';
						for(i in instanceList[instanceIndex].userList) {
							if(i !== '0') {
								result = result + ' ';
							}
							result = result + instanceList[instanceIndex].userList[i].name;
						}
						ws.send('x' + result);
					}
				break;
			}
		} else {
			switch(msg[0]) {
				case 'f':
					option = splictForSyntax1(msg);
					broadcast(instanceIndex, 'g' + user.name + ' ' + option);
				break;
				case 'j':
					instanceList[instanceIndex].controller.isApproved = true;
					broadcast(instanceIndex, 'k' + user.name);
					if(instanceList[instanceIndex].controller.receivedMessagePool.length > 0) {
						instanceList[instanceIndex].controller.user.ws.send(
							instanceList[instanceIndex].controller.receivedMessagePool[0]
						);
					}
				break;
				case 'l':
					instanceList[instanceIndex].controller.sentMessagePool.length = 0;
					instanceList[instanceIndex].controller.receivedJsonPool.length = 0;
				break;
				case 'm':
					saveJson(instanceIndex, msg);
				break;
				case 'n':
					option = splictForSyntax1(msg);
					instanceList[instanceIndex].controller.receivedMessagePool.push('o' + user.name + ' ' + option);
					if(
						instanceList[instanceIndex].controller.isApproved
						&&
						instanceList[instanceIndex].controller.receivedMessagePool.length === 1
					) {
						instanceList[instanceIndex].controller.user.ws.send(
							instanceList[instanceIndex].controller.receivedMessagePool[0]
						);
					}
				break;
				case 'p':
				case 'q':
				case 's':
					instanceList[instanceIndex].controller.sentMessagePool.push(msg);
				break;
				case 't':
					commit(instanceIndex);
				break;
				case 'v':
					if(instanceList[instanceIndex].controller.isApproved) {
						user.ws.send('k' + instanceList[instanceIndex].controller.user.name);
					}
				break;
				case 'y':
						broadcast(instanceIndex, 'z' + user.name);
				break;
			}
		}
	});
});

server.listen(443);
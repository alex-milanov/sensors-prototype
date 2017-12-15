'use strict';

// express & socket output
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const path = require('path');

app.use(express.static(path.resolve('./dist')));

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Listening on port: ${port}`));

let tempData = {
	users: [],
	messages: []
};

io.sockets.on('connection', function(socket) {
	console.log('Websocket connection!');
	// console.log(socket.handshake);
	socket.on('message', function(msg) {
		console.log('message', msg);
		tempData.messages.push(msg);
		socket.broadcast.emit('message', msg);
	});
	socket.on('join', function(username) {
		console.log('joined', username);
		tempData.users.push({
			username,
			typing: false
		});
		socket.emit('joinSuccess', tempData);
		socket.broadcast.emit('joined', username);
	});
});

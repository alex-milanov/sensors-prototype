'use strict';

let socket = window.io.connect();

const {obj} = require('iblokz-data');

// initial
const initial = {
	username: null,
	messages: [
		// {
		// 	username: 'gosho',
		// 	message: 'hi!'
		// }
	],
	users: [
		// {
		// 	name: 'gosho',
		// 	typing: false
		// },
		// {
		// 	name: 'ivan',
		// 	typing: false
		// }
	]
};

/*
const append = (a, b) =>
	typeof a === 'string' || typeof a === 'number' && a + new Number(b)
	|| a instanceof Array && [].concat(a, b)
	|| a instanceof Object && Object.assign({}, a, b);
*/

const join = username => state => obj.patch(state, 'socket', {username});
const joinSuccess = ({users, messages}) => state => obj.patch(state, 'socket', {users, messages});

const joined = username => state => obj.patch(state, ['socket', 'users'], [].concat(
	state.socket.users,
	{
		username,
		typing: false
	}
));

const message = ({message, username}) => state => obj.patch(state, ['socket', 'messages'], [].concat(
	state.socket.messages,
	{
		message,
		username
	}
));

const actions = {
	initial,
	join,
	joinSuccess,
	joined,
	message
};

let unhook = () => {};

const hook = ({state$, actions}) => {
	// hooks
	socket.on('connect', function() {
		console.log("connected");
		state$.distinctUntilChanged(state => state.socket.username)
			.filter(state => state.socket.username !== null)
			.subscribe(
				({socket: {username}}) => socket.emit('join', username)
			);

		state$.distinctUntilChanged(state => state.socket.messages)
			.filter(state => state.socket.messages.length > 0
					&& state.socket.messages.slice(-1).pop().username === state.socket.username
				)
			.map(state => state.socket.messages.slice(-1).pop())
			.subscribe(message => socket.emit('message', message));

		socket.on('joinSuccess', res => actions.socket.joinSuccess(res));

		socket.on('joined', res => actions.socket.joined(res));
		socket.on('joined', res => actions.users.add({
			name: res
		}));

		socket.on('message', res => actions.socket.message(res));
		socket.on('message', res => actions.users.data(res.username, res.message));

		actions.socket.join('root');

		/*
		state$.distinctUntilChanged(state => state.messages)
			.filter(state => state.messages.length > 0 && state.messages.slice(-1).pop().username === state.username)
			.map(state => state.messages.slice(-1).pop())
			.subscribe(message => socket.emit('message', message));
		*/

		// socket.on('joinSuccess', res => actions.joinSuccess(res));
	});

	state$.distinctUntilChanged(state => state.socket.mode)
		.subscribe(state => {
			let z;
			switch (state.socket.mode) {
				case 'server':
					actions.set(['socket', 'msg'], '\nServer mode');
					// actions.append('msg', '\nError: ' + JSON.stringify(err));
					break;
				case 'client':
					actions.set(['socket', 'msg'], '\nClient mode');

					break;
				default:
				case 'idle':
					actions.set('msg', '\nIdling ....');
					break;
			}
		});
};

module.exports = {
	actions,
	hook,
	unhook
};

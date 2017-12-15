'use strict';

// dom
const {
	h1, a, div, form, input, label,
	section, button, span, pre, ul, li
} = require('iblokz-snabbdom-helpers');
// components

const formUtil = require('../util/form');

module.exports = ({state, actions}) => div('#ui', [].concat(
	(!state.socket.username)
		? form('#login-form', {
			on: {
				submit: ev => {
					ev.preventDefault();
					let data = formUtil.toData(ev.target);
					console.log(data);
					actions.socket.join(data.username);
				}
			}
		}, [
			div('#name', input('[name="username"]')),
			button('Connect')
		])
		: [
			pre('#log', state.socket.messages
				.map(msg =>
					div('.msg', [
						span('.name', msg.username),
						span(': '),
						span('.text', JSON.stringify(msg.message))
					])
				)
			),
			ul('#users', state.socket.users.map(
				user => li(user.username + ((user.typing) ? ' (typing)' : ''))
			)),
			form('#msg-form', {
				on: {
					submit: ev => {
						ev.preventDefault();
						let data = formUtil.toData(ev.target);
						actions.socket.message({
							message: data.message,
							username: state.socket.username
						});
					}
				}
			}, [
				div('#new-msg',
					input({
						attrs: {
							name: 'message',
							placeholder: 'Type new message',
							value: ''
						}
					})
				),
				button('Send')
			])
		])
);

'use strict';

// lib
const {obj} = require('iblokz-data');
const objectId = require('bson-objectid');

const indexAt = (a, k, v) => a.reduce((index, e, i) => ((e[k] === v) ? i : index), -1);
console.log(indexAt([{a: 0}, {a: 5}, {a: 7}, {a: 2}], 'a', 0));

const arrPatchAt = (a, k, v, patch) => [indexAt(a, k, v)]
	.map(index => [].concat(
		a.slice(0, index),
		(patch instanceof Function)
			? patch(a[index], index)
			: [Object.assign({}, a[index], patch)],
		a.slice(index + 1)
	)).pop();

const initial = {
	list: [{
		_id: 'root',
		name: 'root',
		data: {
		}
	}]
};

const add = user => state => obj.patch(state, 'users', {
	list: [].concat(
		state.users.list,
		Object.assign({}, user, {
			_id: user._id || objectId().str
		})
	)
});

const data = (name, data) => state => (indexAt(state.users.list, 'name', name) === -1)
	? state
	: obj.patch(state, 'users', {
		list: arrPatchAt(state.users.list, 'name', name, {
			data
		})
	});

module.exports = {
	initial,
	add,
	data
};

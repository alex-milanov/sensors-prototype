'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// app
const app = require('./util/app');
let actions = app.adapt(require('./actions'));
let ui = require('./ui');
let actions$;
const state$ = new Rx.BehaviorSubject();

// services
// socket
let socket = require('./services/socket');
actions = app.attach(actions, 'socket', socket.actions);
let viz = require('./services/viz');

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		actions.stream.onNext(state => state);
	});
	// viz
	module.hot.accept("./services/viz", function() {
		console.log('updating viz');
		viz.unhook();
		// console.log('updating render3d');
		viz = require('./services/viz');
		// actions = app.attach(actions, 'rest', rest.actions);
		// viz.hook({state$, actions});
		actions.set('needsRefresh', true);
		// state$.connect();
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
actions$
	.map(action => (
		action.path && console.log(action.path.join('.'), action.payload),
		console.log(action),
		action)
	)
	.scan((state, change) => change(state), actions.initial)
	.startWith(actions.initial)
	.map(state => (console.log(state), state))
	.subscribe(state => state$.onNext(state));

// state change hooks
socket.hook({state$, actions});

// refesh
state$.distinctUntilChanged(state => state.needsRefresh)
	.filter(state => state.needsRefresh)
	.subscribe(state =>
			actions.toggle('needsRefresh')
	);

$.interval(100).map(() => document.querySelector('#viz'))
	.distinctUntilChanged(canvas => canvas)
	.filter(canvas => canvas)
	.subscribe(canvas => {
		viz.unhook();
		viz.hook({state$, actions, canvas});
	});

// state -> ui
const ui$ = state$.map(state => ui({state, actions}));
vdom.patchStream(ui$, '#ui');

// livereload impl.
if (module.hot) {
	document.write(`<script src="http://${(location.host || 'localhost').split(':')[0]}` +
	`:35729/livereload.js?snipver=1"></script>`);
}

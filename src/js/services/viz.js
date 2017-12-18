'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;
const THREE = require('three');
const d3 = require("d3");
require("d3-selection-multi");

// util
const d3Util = require('../util/d3');

let unhook = () => {};

const render = ({ctx, nodes, links}) => {
	const {width, height} = ctx.canvas;
	ctx.clearRect(0, 0, width, height);
	ctx.save();
	ctx.translate(width / 2, height / 2);

	ctx.beginPath();
	links.forEach(d => d3Util.drawLink({ctx, d}));
	ctx.shadowBlur = 40;
	ctx.shadowColor = "#111";
	ctx.strokeStyle = "#111";
	ctx.lineWidth = 1;
	ctx.stroke();

	nodes.forEach(d => d3Util.drawNode({ctx, d}));

	ctx.restore();
};

const hook = ({state$, actions, canvas}) => {
	let subs = [];

	const ctx = canvas.getContext("2d");
	canvas.width = canvas.parentNode.offsetWidth;
	canvas.height = canvas.parentNode.offsetHeight;

	const parseNodes = list => list.map((user, i) =>
			Object.assign({}, user, {
				index: i,
				color: i > 0 ? 'green' : 'red'
			})
		);

	let nodes = [];
	let links = [];

	const nodesAndLinks$ = state$.distinctUntilChanged(state => state.users.list)
		.map(state => state.users.list)
		.map(parseNodes)
		.map(nodes => ({
			nodes,
			links: d3.range(nodes.length - 1).map(i => ({source: 0, target: i + 1}))
		}));

	let simulation = d3.forceSimulation(nodes)
		.force("charge", d3.forceManyBody())
		.force("link", d3.forceLink(links).strength(0.5).distance(70))
		.on('tick', () => render({ctx, nodes, links}));

	nodesAndLinks$
		.subscribe(nl => {
			nodes = nl.nodes.map((node, i) => Object.assign(nodes[i] || {}, node));
			links = nl.links.map((link, i) => Object.assign(links[i] || {}, link));
			simulation.nodes(nodes);
			simulation.force("link", d3.forceLink(links).strength(0.5).distance(70));
			simulation.restart();
		});
		// .force(“x”, d3.forceX())
		// .force(“y”, d3.forceY())
		// .on('tick', () => render({ctx, nodes, links}));

	d3.select(canvas)
		.call(d3.drag()
			.container(canvas)
			.subject(() => d3Util.dragsubject({simulation, ctx}))
			.on("start", () => d3Util.dragstarted({simulation}))
			.on("drag", () => d3Util.dragged({simulation}))
			.on("end", () => d3Util.dragended({simulation})));

	// console.log(state$, actions, canvas);

	unhook = () => subs.forEach(sub => sub.unsubscribe());
};

module.exports = {
	hook,
	unhook
};

'use strict';

const d3 = require("d3");

// D3 INIT
const dragsubject = ({simulation, ctx}) => simulation
	.find(d3.event.x - ctx.canvas.width / 2, d3.event.y - ctx.canvas.height / 2);

const dragstarted = ({simulation}) => {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d3.event.subject.fx = d3.event.subject.x;
	d3.event.subject.fy = d3.event.subject.y;
};

const dragged = () => {
	d3.event.subject.fx = d3.event.x;
	d3.event.subject.fy = d3.event.y;
};

const dragended = ({simulation}) => {
	if (!d3.event.active) simulation.alphaTarget(0);
	d3.event.subject.fx = null;
	d3.event.subject.fy = null;
};

const drawLink = ({ctx, d}) => {
	ctx.moveTo(d.source.x, d.source.y);
	ctx.lineTo(d.target.x, d.target.y);
};

const drawNode = ({ctx, d}) => {
	ctx.beginPath();
	ctx.shadowBlur = 12;
	ctx.shadowColor = d.color;
	ctx.moveTo(d.x + 6, d.y);
	ctx.arc(d.x, d.y, 6, 0, 2 * Math.PI);
	ctx.fillStyle = d.color;
	ctx.fill();
	ctx.font = "12px Arial";
	ctx.fillText(d.name, d.x + 18, d.y);
	if (d.data) {
		ctx.fillStyle = 'white';
		ctx.font = "12px Arial";
		Object.keys(d.data).forEach((key, i) => {
			ctx.fillText(key + ': ' + JSON.stringify(d.data[key]), d.x + 18, d.y + (14 * (i + 1)));
			// ctx.fillText(d.data.temperature + '°C', d.x + 18, d.y + 14);
			// ctx.fillText(d.data.humidity + '%', d.x + 18, d.y + 28);
		});
	}
};

module.exports = {
	dragsubject,
	dragstarted,
	dragged,
	dragended,
	drawLink,
	drawNode
};

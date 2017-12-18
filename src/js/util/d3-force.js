'use strict';

// ref: https://github.com/d3/d3-force/blob/master/src/link.js

const jiggle = () => (Math.random() - 0.5) * 1e-6;

// count = connections
const defaultStrength = (link, count = []) =>
		1 / Math.min(count[link.source.index], count[link.target.index]);

const force = (alpha, links, iterations, distances, strengths, bias) => {
	for (var k = 0, n = links.length; k < iterations; ++k) {
		for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
			let link = links[i];
			let source = link.source;
			let target = link.target;
			x = target.x + target.vx - source.x - source.vx || jiggle();
			y = target.y + target.vy - source.y - source.vy || jiggle();
			l = Math.sqrt(x * x + y * y);
			l = (l - distances[i]) / l * alpha * strengths[i];
			x *= l;
			y *= l;
			target.vx -= x * (b = bias[i]);
			target.vy -= y * b;
			source.vx += x * (b = 1 - b);
			source.vy += y * b;
		}
	}
};

module.exports = {
	jiggle,
	defaultStrength,
	force
};

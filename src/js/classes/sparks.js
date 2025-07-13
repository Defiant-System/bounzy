
class Sparks {
	constructor(cfg) {
		let { parent, x, y } = cfg;

		this.parent = parent
		this.parts = [];
		this.gravity = 1.15;
		this.alpha = 1;
		this.trailLen = 5;
		this.decay = Utils.random(.015, .025);
		// this ensures this to be rendered on top
		this._fx = true;
		
		let position = new Point(x, y);
		this.x = x;
		this.y = y;

		let len = 2;
		while (len--) {
			let vX = Utils.random(-1.5, 1.5),
				vY = Utils.random(-1.5, 1.5),
				angle = Utils.random(-2, -1);
			this.parts.push({
				pos: position.clone(),
				vel: new Point(vX, vY),
				trail: [],
				angle,
			});
		}

		// add entity to entries list
		this.parent.addEntity(this);
	}

	update(delta) {
		let m = delta/16;
		this.parts.map(p => {
			p.pos.x += p.vel.x + Math.cos(p.angle) * m;
			p.pos.y += p.vel.y + Math.sin(p.angle) * m + this.gravity;

			// prepend position to trail
			p.trail.unshift([p.pos.x, p.pos.y]);
			let [x2, y2] = p.trail[5] || [p.pos.x, p.pos.y];
			p.x2 = x2;
			p.y2 = y2;
			// trim trail log
			p.trail.splice(this.trailLen, this.trailLen);
		});

		// remove parts if fade is < zero
		this.alpha -= this.decay;
		if (this.alpha < 0) this.parent.removeEntity(this);
	}

	render(ctx) {
		ctx.save();
		ctx.lineWidth = 2.5;
		ctx.strokeStyle = "#fff9";
		// ctx.globalAlpha = this.alpha;
		this.parts.map(p => {
			let x1 = p.pos.x,
				y1 = p.pos.y,
				x2 = p.x2,
				y2 = p.y2;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		});
		ctx.restore();
	}
}

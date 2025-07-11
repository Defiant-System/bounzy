
class Bullet {
	constructor(cfg) {
		let { parent, start, target, velocity } = cfg;

		this.parent = parent;
		this.start = start;
		this.target = target;
		this.velocity = velocity;
	}

	update(delta, time) {
		
	}

	render(ctx) {
		ctx.save();
		ctx.translate(this.start.x, this.start.y);
		// target point
		ctx.fillStyle = "#f00";
		ctx.beginPath();
		ctx.arc(0, 0, 15, 0, Math.TAU);
		ctx.fill();
		ctx.restore();
	}
}

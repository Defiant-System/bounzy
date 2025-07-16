
class Wall {
	constructor(cfg) {
		let { parent } = cfg;

		this.parent = parent;
		this.x = 23;
		this.y = 557;
		this.w = 70;
		this.h = 14;

		this.health = {
			full: 10,
			curr: 7,
			perc: 1,
		};
	}

	update(delta, time) {
		this.health.perc = this.health.curr / this.health.full;
	}

	render(ctx) {
		let w = this.w,
			h = this.h,
			wH = w >> 1,
			health = this.health;
		ctx.save();
		ctx.translate(this.x, this.y);

		ctx.font = "24px Bakbak One";
		ctx.textAlign = "center";
		ctx.lineWidth = 7;
		ctx.strokeStyle = "#0008";
		ctx.strokeText(health.curr, wH, 2);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "#0008";
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.roundRect(0, 0, w, h, 4);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#f00";
		ctx.beginPath();
		ctx.roundRect(2, 2, health.perc*w, h-4, [3, 0, 0, 3]);
		ctx.fill();

		ctx.lineWidth = 3;
		ctx.strokeStyle = "#fff";
		ctx.strokeText(health.curr, wH, 2);
		ctx.fillText(health.curr, wH, 2);

		ctx.restore();
	}
}

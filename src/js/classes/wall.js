
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
			curr: 10,
			perc: 1,
		};
	}

	dealDamage(v=1) {
		this.health.curr -= v;
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
		ctx.lineWidth = 6;
		ctx.strokeStyle = "#0008";
		ctx.strokeText(health.curr, wH, 3);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "#0008";
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.roundRect(0, 0, w, h, 4);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#792";
		ctx.strokeStyle = "#fff";

		ctx.save();
		// health area clipping
		ctx.beginPath();
		ctx.rect(2, 2, (w-4) * health.perc, h-4);
		ctx.clip();
		// health bar
		ctx.beginPath();
		ctx.roundRect(2, 2, w-4, h-4, 3);
		ctx.fill();
		ctx.restore();

		ctx.lineWidth = 3;
		ctx.strokeText(health.curr, wH, 3);
		ctx.fillText(health.curr, wH, 3);

		ctx.restore();
	}
}


class Wizard {
	constructor(cfg) {
		let { parent, asset } = cfg;

		this.parent = parent;
		this.asset = asset;

		// static / asset dimensions
		this.w = 20;
		this.h = 1024;
		this.speed = 2;
		this.degToRad = Math.PI / 180;

		// this animation / overlapping helpers
		this.a1 = { x: 0, y: 500 };
		this.a2 = { x: 0, y: -this.h+this.a1.y };
		// start + target
		this.start = { x: 160, y: 590 };
		this.target = { x: 40, y: 250 };
		// target angle
		this.angle = 175;

		this.len = 600;
	}

	setTarget(x, y) {
		this.target.x = x;
		this.target.y = y;
	}

	update(delta, time) {
		this.a1.y += this.speed;
		this.a2.y += this.speed;
		// continuous arrows
		if (this.len - this.a1.y < 0) this.a1.y = -this.h + this.a2.y;
		if (this.len - this.a2.y < 0) this.a2.y = -this.h + this.a1.y;
	}

	render(ctx) {
		ctx.save();
		ctx.translate(this.start.x + 10, this.start.y);
		ctx.rotate(this.degToRad * this.angle);
		// mask
		let region = new Path2D();
		region.moveTo(0, 0);
		region.lineTo(10, 10);
		region.lineTo(20, 0);
		region.lineTo(20, this.len);
		region.lineTo(10, this.len+10);
		region.lineTo(0, this.len);
		region.closePath();
		ctx.clip(region);

		// for dev purpose
		// ctx.fillStyle = "red";
		// ctx.rect(0, 0, 20, 340);
		// ctx.fill();

		// arrows
		ctx.drawImage(this.asset.img, this.a1.x, this.a1.y, this.w, this.h);
		ctx.drawImage(this.asset.img, this.a2.x, this.a2.y, this.w, this.h);
		ctx.restore();
	}

	render2(ctx) {
		ctx.save();
		ctx.lineWidth = 32;
		ctx.strokeStyle = "#fff9";
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.target.x, this.target.y);
		ctx.stroke();
		ctx.restore();
	}
}

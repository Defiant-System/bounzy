
class Wizard {
	constructor(cfg) {
		let { parent, asset } = cfg;

		this.parent = parent;
		this.asset = asset;

		// static / asset dimensions
		this.w = 20;
		this.h = 1024;
		this.speed = .8;
		this.degToRad = Math.PI / 180;

		// this animation / overlapping helpers
		this.a1 = { x: 0, y: 500 };
		this.a2 = { x: 0, y: -this.h+this.a1.y };
		// start + target
		this.start = new Point(160, 590);
		this.setTarget(80, 50);
	}

	setTarget(x, y) {
		this.target = new Point(x, y);
		// target angle
		this.angle = this.start.direction(this.target) - (Math.PI / 2);
		this.distance = this.start.distance(this.target);
	}

	update(delta, time) {
		this.a1.y += this.speed;
		this.a2.y += this.speed;
		// continuous arrows
		if (this.distance - this.a1.y < 0) this.a1.y = -this.h + this.a2.y;
		if (this.distance - this.a2.y < 0) this.a2.y = -this.h + this.a1.y;
	}

	render(ctx) {
		ctx.save();
		ctx.translate(this.start.x + 10, this.start.y);
		ctx.rotate(this.angle);
		// mask
		let region = new Path2D();
		region.moveTo(0, 0);
		region.lineTo(10, 10);
		region.lineTo(20, 0);
		region.lineTo(20, this.distance);
		region.lineTo(10, this.distance+10);
		region.lineTo(0, this.distance);
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
}

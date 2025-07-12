
class Wizard {
	constructor(cfg) {
		let { parent, asset } = cfg;

		this.parent = parent;
		this.asset = asset;

		// static / asset dimensions
		this.w = 20;
		this.h = 1024;
		this.speed = .8;
		this._state = false;

		// this animation / overlapping helpers
		this.a1 = { x: 0, y: 500 };
		this.a2 = { x: 0, y: -this.h+this.a1.y };
		// start + target
		this.start = new Point(160, 590);
		// this.setMouse(60, 350);
		// this.setTarget(this.mouse);

		// this ammo mag
		this.reload();

		// target seeker
		Matter.Events.on(parent.engine, "afterUpdate", this.checkCollisions.bind(this));
	}

	checkCollisions() {
		if (this._state !== "aiming") return;
		var bodies = Matter.Composite.allBodies(this.parent.engine.world),
			start = new Vec2(this.start.x, this.start.y),
			end = new Vec2(this.mouse.x, this.mouse.y);
		let query = Matter.Query.ray(bodies, start, end, 10);
		let cols = [];
		let rayTest = new Ray(start, end);
		for (let i=query.length-1; i>=0; i--) {
			let bcols = Ray.bodyCollisions(rayTest, query[i].body);
			for (let k=bcols.length-1; k>=0; k--) {
				cols.push(bcols[k]);
			}
		}
		// sort collisions
		cols.sort((a, b) => a.distance(start) - b.distance(start));
		if (cols.length) end = cols[0];
		this.setTarget(end);
	}

	setMouse(x, y) {
		let point = new Point(x, y),
			start = this.start.clone();
		this.mouse = start.moveTowards(point, 1200);
		// aiming
		this._state = "aiming";
	}

	setTarget(point) {
		this.target = point;
		// target angle
		this.angle = this.start.direction(this.target) - (Math.PI / 2);
		this.distance = this.start.distance(this.target) - 10;
		this.d2 = this.distance - 10;
	}

	reload() {
		this.magasin = [];
		this.magasin.push({ damage: 5, uI: "b2" });
		this.magasin.push({ damage: 5, uI: "b3" });
		this.magasin.push({ damage: 5, uI: "b4" });
	}

	shoot() {
		let { damage, uI } = this.magasin.pop(),
			start = this.start.clone(),
			target = this.target.clone(),
			angle = this.angle + (Math.PI / 2);
		new Bullet({ parent: this.parent, start, target, angle, damage, uI });
		// no more aiming
		if (this.magasin.length) {
			this._state = "shooting";
			this._tick = this.parent.fpsControl._now;
		} else {
			delete this._state;
			this.reload();
		}
	}

	update(delta, time) {
		switch (this._state) {
			case "shooting":
				if (time - this._tick > 100) {
					this.shoot();
					this._tick = time;
				}
				break;
			case "aiming":
				// smooth scrolling arrows
				this.a1.y += this.speed;
				this.a2.y += this.speed;
				// continuous arrows
				if (this.h - this.a1.y < 0) this.a1.y = -this.h + this.a2.y;
				if (this.h - this.a2.y < 0) this.a2.y = -this.h + this.a1.y;
				break;
		}
	}

	render(ctx) {
		if (this._state == "aiming") {
			ctx.save();
			// target point
			ctx.fillStyle = "#fff6";
			ctx.beginPath();
			ctx.arc(this.target.x, this.target.y, 15, 0, Math.TAU);
			ctx.fill();
			// aiming scrolling arrows
			ctx.translate(this.start.x + 10, this.start.y);
			ctx.rotate(this.angle);
			// mask
			let region = new Path2D();
			region.moveTo(0, 0);
			region.lineTo(10, 10);
			region.lineTo(20, 0);
			region.lineTo(20, this.d2);
			region.lineTo(10, this.distance);
			region.lineTo(0, this.d2);
			region.closePath();
			ctx.clip(region);
			// arrows
			ctx.drawImage(this.asset.img, this.a1.x, this.a1.y, this.w, this.h);
			ctx.drawImage(this.asset.img, this.a2.x, this.a2.y, this.w, this.h);
			ctx.restore();
		}
	}
}

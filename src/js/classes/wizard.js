
class Wizard {
	constructor(cfg) {
		let { parent, asset } = cfg;

		this.parent = parent;
		this.asset = asset;

		// static / asset dimensions
		this.w = 20;
		this.h = 1024;
		this.speed = .8;
		this.halfPI = Math.PI / 2;
		this.radToDeg = 180 / Math.PI;
		this._state = "ready";

		// this animation / overlapping helpers
		this.a1 = { x: 0, y: 500 };
		this.a2 = { x: 0, y: -this.h+this.a1.y };
		// start + target
		this.start = new Point(195, 590);
		// this.setMouse(60, 350);
		// this.setTarget(this.mouse);

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

	setPosition(x) {
		this.start.x = x;
	}

	setMouse(x, y) {
		// bullet still active
		if (["shooting", "waiting"].includes(this._state)) return;

		let point = new Point(x, y),
			start = this.start.clone();
		this.mouse = start.moveTowards(point, 1200);
		// aiming
		this._state = "aiming";
	}

	setTarget(point) {
		let angle = this.start.direction(point),
			deg = angle * this.radToDeg;
		if (deg < -175 || deg > -5) return;

		this.target = point;
		// target angle
		this.angle = angle - this.halfPI;
		this.distance = this.start.distance(this.target) - 10;
		this.d2 = this.distance - 10;
	}

	setMagasin(magasin) {
		this._magasin = [...magasin];
		// this ammo mag
		this.reload();
	}

	reloadAim() {
		// all bullits returned
		this.reload();
		// reloaded and ready
		this._state = "ready";
	}

	reload() {
		this.magasin = [...this._magasin];
	}

	shoot() {
		// bullet still active
		if (["waiting"].includes(this._state)) return;

		let { damage, uI } = this.magasin.shift(),
			start = this.start.clone(),
			target = this.target.clone(),
			angle = this.angle + (Math.PI / 2);
		new Bullet({ parent: this.parent, start, target, angle, damage, uI });
		// no more aiming
		if (this.magasin.length) {
			this._state = "shooting";
			this._tick = this.parent.fpsControl._now;
		} else {
			this._state = "waiting";
		}
	}

	update(delta, time) {
		switch (this._state) {
			case "ready":
				// ready to shoot
				break;
			case "waiting":
				// wait for all bullets to return
				break;
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
		if (this.parent.debug.mode >= 1) {
			ctx.save();
			ctx.fillStyle = "#fff7";
			ctx.translate(this.start.x, this.start.y);
			ctx.beginPath();
			ctx.arc(0, 0, 15, 0, Math.TAU);
			ctx.fill();
			ctx.restore();
		}
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

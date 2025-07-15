
class Boss {
	constructor(cfg) {
		let { parent, hasShield, type, x, y } = cfg,
			asset = parent.assets.bosses,
			shadow = parent.assets.shadow;

		this.parent = parent;
		this.asset = asset.img;
		this.shadow = shadow.img;
		this.sW = shadow.item.width;
		this.sH = shadow.item.height;
		this.alpha = 0;

		// monster health based on "level", "type" and "average ammo damage"
		let lab = parent.APP.settings.state.laboratory,
			base = (lab.front.damage * lab.front.length) + (lab.back.damage * lab.back.length),
			full = (+parent._level + +type + 1) * base;
		this.health = { full, curr: full, perc: 1 };

		let size = 65,
			label = "boss-"+ Date.now();
		this.hS = size >> 1;
		this.width = 130;
		this.height = 130;
		this.x = x * size;
		this.y = y * size;
		this._y = this.y;
		this.fY = (type - 1);
		this.type = "brick";

		// physical body
		let collisionFilter = { category: parent.colMasks.monster },
			path = window.find(`svg#boss-mask path`)[0],
			vertexSets = Matter.Svg.pathToVertices(path, 12);
		this.body = Matter.Bodies.fromVertices(this.x+size, this.y+size, vertexSets, { isStatic: true, collisionFilter, label });

		// prevents rotation
		Matter.Body.setInertia(this.body, Infinity);

		// boss animation
		this.frame = {
			index: 0,
			step: 1,
			total: 7,
			last: 120,
			speed: 120,
		};

		// add this to game loop
		this.parent.addEntity(this);

		this.advance();
	}

	advance() {
		// smooth drop
		let size = this.height >> 1;
		this._y = this.y + size;
		// re-calc position of physical bodies
		let x = this.x + size,
			y = this._y + size,
			position = Matter.Vector.create(x, y);
		Matter.Body.setPosition(this.body, position)
	}

	kill(anim) {
		if (anim) {
			let parent = this.parent,
				x = this.position.x,
				y = this.position.y;
			// new Die({ parent, type: "smoke", x, y });
		}
		// remove this from game loop
		this.parent.removeEntity(this);
	}

	dealDamage(v) {
		this.health.curr -= v;
		this.health.perc = this.health.curr / this.health.full;
		if (this.health.curr <= 0) this.kill();
	}

	update(delta, time) {
		this.frame.last -= delta;
		if (this.frame.last < 0) {
			this.frame.last = (this.frame.last + this.frame.speed) % this.frame.speed;
			this.frame.index += this.frame.step;
			if ((this.frame.index >= this.frame.total) || (this.frame.index <= 0)) this.frame.step *= -1;
		}
		// smooth drop
		let diff = this._y - this.y,
			p = .1;
		if (diff > p) this.y += diff * p;
		else this.y = this._y;
		// if newly added monsters; fade in
		if (this.alpha < 1) this.alpha += .05;
	}

	render(ctx) {
		let w = this.width,
			h = this.height,
			fX = (this.frame.index | 0) * w,
			fY = this.fY,
			wH = w >> 1,
			tH = h - 13;
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.translate(this.x, this.y);
		// ctx.drawImage(this.shadow, 0, 0, this.sW, this.sH, -18, 9, w, h);
		ctx.drawImage(this.asset, fX, fY, w, h, 0, 0, w, h);

		ctx.font = "30px Bakbak One";
		ctx.textAlign = "center";
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#1358";
		ctx.strokeText(this.health.curr, wH, tH);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "#1358";
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.roundRect(4, h-16, w-10, 14, 3);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#369";
		ctx.beginPath();
		ctx.roundRect(6, h-14, (w-14) * this.health.perc, 10, 2);
		ctx.fill();

		ctx.lineWidth = 3;
		ctx.strokeStyle = "#fff";
		ctx.strokeText(this.health.curr, wH, tH);
		ctx.fillText(this.health.curr, wH, tH);

		ctx.restore();
	}
}

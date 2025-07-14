
class Monster {
	constructor(cfg) {
		let { parent, hasShield, type, x, y } = cfg,
			asset = parent.assets.monsters,
			shadow = parent.assets.shadow;

		this.parent = parent;
		this.hasShield = hasShield;
		this.asset = asset.img;
		this.shadow = shadow.img;
		this.sW = shadow.item.width;
		this.sH = shadow.item.height;

		this.health = {
			full: 40,
			curr: 40,
			perc: 1,
		};

		let size = 65,
			label = "monster-"+ Date.now();
		this.sH = size >> 1;
		this.width = size;
		this.height = size;
		this.x = x * size;
		this.y = y * size;
		this._y = this.y;
		this.type = (type - 1) * size;

		// physical body
		let collisionFilter = { category: parent.colMasks.monster };
		if (this.hasShield) {
			this.body = Matter.Bodies.rectangle(this.x+this.sH, this.y+size-38, size, size-17, { isStatic: true, collisionFilter, label });
			// shield object
			collisionFilter = { category: parent.colMasks.walls };
			this.shield = Matter.Bodies.rectangle(this.x+this.sH, this.y+size-7, size, 12, { isStatic: true, collisionFilter, label: "shield" });
			// this.shield.label = "monster-"+ Date.now();
			Matter.Body.setInertia(this.shield, Infinity);
		} else {
			let path = window.find(`svg#monster-mask path`)[0],
				vertexSets = Matter.Svg.pathToVertices(path, 12);
			this.body = Matter.Bodies.fromVertices(this.x+this.sH, this.y+this.sH, vertexSets, { isStatic: true, collisionFilter, label });
		}
		// prevents rotation
		Matter.Body.setInertia(this.body, Infinity);

		// monster animation
		this.frame = {
			index: 0,
			step: 1,
			total: 4,
			last: 120,
			speed: 120,
		};

		// add this to game loop
		this.parent.addEntity(this);
	}

	advance() {
		this._y = this.y + this.height;
		// this.body.position.y = this._y;

		let position = Matter.Vector.create(this.x+this.sH, this._y+this.sH);
		Matter.Body.setPosition(this.body, position);
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
	}

	render(ctx) {
		let w = this.width,
			h = this.height,
			fX = (this.frame.index | 0) * w,
			fY = this.type,
			wH = this.sH,
			tH = h - 7;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.drawImage(this.shadow, 0, 0, this.sW, this.sH, -18, 9, w, h);
		ctx.drawImage(this.asset, fX, fY, w, h, 0, 0, w, h);

		if (this.hasShield) {
			ctx.drawImage(this.asset, 0, 455, w, h, 0, 0, w, h);
		}

		ctx.font = "20px Bakbak One";
		ctx.textAlign = "center";
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#0008";
		ctx.strokeText(this.health.curr, wH, tH);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "#0008";
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.roundRect(4, h-10, w-10, 8, 3);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#f00";
		ctx.beginPath();
		ctx.roundRect(6, h-8, (w-14) * this.health.perc, 4, 2);
		ctx.fill();

		ctx.lineWidth = 3;
		ctx.strokeStyle = "#fff";
		ctx.strokeText(this.health.curr, wH, tH);
		ctx.fillText(this.health.curr, wH, tH);

		ctx.restore();
	}
}

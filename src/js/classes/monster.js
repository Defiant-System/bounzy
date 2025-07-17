
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
		this.alpha = 0;

		// monster health based on "level", "type" and "average ammo damage"
		let lab = parent.APP.settings.state.laboratory,
			base = (lab.front.damage / lab.front.length) + (lab.back.damage / lab.back.length),
			full = base + (parent._level * base) + (type * base);
		this.health = { full, curr: full, perc: 1 };
		this.damage = { step: 0, val: 0 };

		let size = 65,
			label = (type === "7" ? "chest-" : "monster-")+ Date.now();
		this.hS = size >> 1;
		this.width = size;
		this.height = size;
		this.x = x * size;
		this.y = y * size;
		this._y = this.y;
		this.fY = (type - 1) * size;
		this.type = "brick";

		// physical body
		let collisionFilter = { category: parent.colMasks.monster };
		if (this.hasShield) {
			this.body = Matter.Bodies.rectangle(this.x+this.hS, this.y+size-38, size, size-17, { isStatic: true, collisionFilter, label });
			// shield object
			collisionFilter = { category: parent.colMasks.walls };
			this.shield = Matter.Bodies.rectangle(this.x+this.hS, this.y+size-7, size, 12, { isStatic: true, collisionFilter, label: "shield" });
			// this.shield.label = "monster-"+ Date.now();
			Matter.Body.setInertia(this.shield, Infinity);
		} else {
			let path = window.find(`svg#monster-mask path`)[0],
				vertexSets = Matter.Svg.pathToVertices(path, 12);
			this.body = Matter.Bodies.fromVertices(this.x+this.hS, this.y+this.hS, vertexSets, { isStatic: true, collisionFilter, label });
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

		this.advance();
	}

	advance() {
		// smooth drop
		this._y = this.y + this.height;
		// re-calc position of physical bodies
		let x = this.x + this.hS,
			y, position;
		if (this.hasShield) {
			y = this._y + this.height - 38,
			position = Matter.Vector.create(x, y);
			Matter.Body.setPosition(this.body, position)
			// move down shield
			y = this._y + this.height - 7;
			position = Matter.Vector.create(x, y);
			Matter.Body.setPosition(this.shield, position);
		} else if (this._y >= this.parent.offset.h - this.height) {
			// deal damage to wall
			this.parent.wall.dealDamage(1);
			// kill while showing "-1"
			this.kill("num");
		} else {
			y = this._y + this.hS,
			position = Matter.Vector.create(x, y);
			Matter.Body.setPosition(this.body, position)
		}
	}

	kill(anim) {
		if (anim) {
			if (anim === "num") new Die({ type: "puff", parent: this.parent, x: this.x, y: this.y });
			else new Die({ type: "puff", parent: this.parent, x: this.x, y: this.y });
		}
		// if chest unlocked
		if (this.body.label.startsWith("chest-")) {
			this.parent.APP.dispatch({ type: "unlock-chest" });
		}
		// remove this from game loop
		this.parent.removeEntity(this);
	}

	dealDamage(v) {
		this.health.curr -= v;
		this.health.perc = this.health.curr / this.health.full;
		if (this.health.curr <= 0) this.kill(true);
		// ui feedback
		this.damage.val = `-${v}`;
		this.damage.step = 40;
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
		// damage digit anim
		if (this.damage.step > 0) this.damage.step--;
	}

	render(ctx) {
		let w = this.width,
			h = this.height,
			fX = (this.frame.index | 0) * w,
			fY = this.fY,
			wH = this.hS,
			tH = h - 7,
			dI = this.damage.step;
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.translate(this.x, this.y);
		ctx.drawImage(this.shadow, 0, 0, this.sW, this.sH, -18, 9, w, h);
		ctx.drawImage(this.asset, fX, fY, w, h, 0, 0, w, h);

		if (this.hasShield) {
			ctx.drawImage(this.asset, 0, 455, w, h, 0, 0, w, h);
		}

		// health value
		ctx.font = "20px Bakbak One";
		ctx.textAlign = "center";
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#0008";
		ctx.strokeText(this.health.curr, wH, tH);
		// health bar
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#0008";
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.roundRect(4, h-10, w-10, 8, 3);
		ctx.fill();
		ctx.stroke();
		// health current
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#fff";
		ctx.fillStyle = "#f00";
		ctx.beginPath();
		ctx.roundRect(6, h-8, (w-14) * this.health.perc, 4, 2);
		ctx.fill();
		// health value
		ctx.strokeText(this.health.curr, wH, tH);
		ctx.fillText(this.health.curr, wH, tH);

		if (dI) {
			// damage value
			ctx.save();
			dI /= 4;
			ctx.font = `${(16+dI)|0}px Bakbak One`;
			dI *= .5;
			ctx.strokeText(this.damage.val, wH, 15+dI);
			ctx.fillText(this.damage.val, wH, 15+dI);
			ctx.restore();
		}

		ctx.restore();
	}
}

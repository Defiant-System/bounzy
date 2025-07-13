
class Monster {
	constructor(cfg) {
		let { parent, asset, shadow, type, x, y } = cfg;

		this.parent = parent;
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
			sH = size >> 1;
		this.width = size;
		this.height = size;
		this.x = x * size;
		this.y = y * size;
		this.type = (type - 1) * size;

		// physical body
		let path = window.find(`svg#monster-mask path`)[0],
			vertexSets = Matter.Svg.pathToVertices(path, 12),
			collisionFilter = { category: parent.colMasks.monster };
		this.body = Matter.Bodies.fromVertices(this.x+sH, this.y+sH, vertexSets, { isStatic: true, collisionFilter });
		this.body.label = "monster-"+ Date.now();
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
	}

	kill() {
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
	}

	render(ctx) {
		let w = this.width,
			h = this.height,
			fX = (this.frame.index | 0) * w,
			fY = this.type,
			wH = w >> 1,
			tH = h - 7;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.drawImage(this.shadow, 0, 0, this.sW, this.sH, -18, 9, w, h);
		ctx.drawImage(this.asset, fX, fY, w, h, 0, 0, w, h);

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

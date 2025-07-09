
class Monster {
	constructor(cfg) {
		let { parent, asset, shadow, type, x, y } = cfg;

		this.parent = parent;
		this.asset = asset.img;
		this.shadow = shadow.img;
		this.sW = shadow.item.width;
		this.sH = shadow.item.height;

		let size = 65,
			sH = size >> 1;
		this.width = size;
		this.height = size;
		this.x = x * size;
		this.y = y * size;
		this.type = (type - 1) * size;

		// physical body
		// this.body = Matter.Bodies.rectangle(this.x + sH, this.y + sH, size, size, { isStatic: true });
		// this.body = Matter.Bodies.polygon(this.x+sH, this.y+sH, 8, sH, { isStatic: true });
		let path = window.find(`svg#monster-mask path`)[0],
			vertexSets = Matter.Svg.pathToVertices(path, 12);
		this.body = Matter.Bodies.fromVertices(this.x+sH, this.y+sH, vertexSets, { isStatic: true });
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
			x = this.x,
			y = this.y;
		ctx.save();
		ctx.translate(0, 0);
		ctx.drawImage(this.shadow, 0, 0, this.sW, this.sH, x-18, y+9, w, h);
		ctx.drawImage(this.asset, fX, fY, w, h, x, y, w, h);
		ctx.restore();
	}
}


class Monster {
	constructor(cfg) {
		let { parent, asset, shadow, type, x, y } = cfg;

		this.parent = parent;
		this.asset = asset.img;
		this.shadow = shadow.img;
		this.sW = shadow.item.width;
		this.sH = shadow.item.height;

		let size = 65;
		this.width = size;
		this.height = size;
		this.x = x * size;
		this.y = y * size;
		this.type = (type - 1) * size;

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

		// ctx.fillStyle = "#f005";
		// ctx.fillRect(0, 0, w, h);
		// ctx.fillRect((w*1), (h*1), w, h);
		// ctx.fillRect((w*2), (h*2), w, h);
		// ctx.fillRect((w*3), (h*3), w, h);
		// ctx.fillRect((w*4), (h*4), w, h);
		// ctx.fillRect((w*5), (h*5), w, h);
		// ctx.fillRect((w*4), (h*6), w, h);
		// ctx.fillRect((w*3), (h*7), w, h);

		ctx.restore();
	}
}

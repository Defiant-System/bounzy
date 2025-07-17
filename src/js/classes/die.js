
class Die {
	constructor(cfg) {
		let { parent, type, x, y } = cfg;

		this.parent = parent;

		let frames = {
				vortex: {
					asset: "vortex",
					speed: 20,
					strip: [
						{ w: 25, h: 25, oX: 0, oY: 0 },
						{ w: 25, h: 25, oX: 25, oY: 0 },
						{ w: 25, h: 25, oX: 50, oY: 0 },
						{ w: 25, h: 25, oX: 75, oY: 0 },
						{ w: 25, h: 25, oX: 100, oY: 0 },
						{ w: 25, h: 25, oX: 125, oY: 0 },
						{ w: 25, h: 25, oX: 150, oY: 0 },
						{ w: 25, h: 25, oX: 175, oY: 0 },
						{ w: 25, h: 25, oX: 200, oY: 0 },
						{ w: 25, h: 25, oX: 225, oY: 0 },
						{ w: 25, h: 25, oX: 250, oY: 0 },
						{ w: 25, h: 25, oX: 275, oY: 0 },
						{ w: 25, h: 25, oX: 300, oY: 0 },
						{ w: 25, h: 25, oX: 325, oY: 0 },
					]
				},
				puff: {
					asset: "monsters",
					speed: 60,
					strip: [
						{ w: 65, h: 65, oX: 260, oY: 455 },
						{ w: 65, h: 65, oX: 195, oY: 455 },
						{ w: 65, h: 65, oX: 130, oY: 455 },
						{ w: 65, h: 65, oX: 65, oY: 455 },
					]
				}
			};
		this.anim = frames[type];
		this.asset = parent.assets[this.anim.asset].img;
		this.x = x;
		this.y = y;
		// this ensures this to be rendered on top
		this._fx = true;

		// die animation
		this.frame = {
			index: 0,
			total: this.anim.strip.length-1,
			last: this.anim.speed,
			speed: this.anim.speed,
		};

		// add this to game loop
		this.parent.addEntity(this);
	}

	update(delta, time) {
		this.frame.last -= delta;
		if (this.frame.last < 0) {
			this.frame.last = (this.frame.last + this.frame.speed) % this.frame.speed;
			this.frame.index++;
			if (this.frame.index >= this.frame.total) {
				this.parent.removeEntity(this);
			}
		}
	}

	render(ctx) {
		let { w, h, oX, oY } = this.anim.strip[this.frame.index];
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.drawImage(this.asset, oX, oY, w, h, 0, 0, w, h);
		ctx.restore();
	}
}

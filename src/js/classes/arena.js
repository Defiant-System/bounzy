
class Arena {
	constructor(cfg) {
		let { canvas } = cfg;

		this.cvs = canvas;
		this.ctx = this.cvs[0].getContext("2d");
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		// set dimenstions
		this.cvs.attr({ width: this.width, height: this.height });

		// physics engine
		this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 1 } });
		// create runner
		this.runner = Matter.Runner.create();

		// dev / debug purpose
		this.debug = {
			mode: 2,
		};

		// create FPS controller
		let Self = this;
		this.fpsControl = karaqu.FpsControl({
			fps: 60,
			callback(time, delta) {
				// Matter.Runner.tick(Self.runner, Self.engine);
				Self.update(delta, time);
				Self.render();
			}
		});

		// assets list
		let assets = [
				{ id: "bosses", width: 1024, height: 1024, src: "~/gfx/monster-sheet0.webp" },
				{ id: "monsters", width: 1024, height: 1024, src: "~/gfx/monster-sheet1.webp" },
				{ id: "shield", width: 64, height: 41, src: "~/gfx/shield-sheet0.webp" },
			],
			loadAssets = () => {
				let item = assets.pop(),
					img = new Image();
				img.src = item.src;
				img.onload = () => {
					// save reference to asset
					this.assets[item.id] = { item, img };
					// are we done yet?
					assets.length ? loadAssets() : this.ready();
				};
			};
		// asset lib
		this.assets = {};

		// load assets
		loadAssets();
	}

	ready() {
		// stadium & field
		// this.setStadium();
		// play FPS control
		// this.fpsControl.start();
	}

	update(delta, time) {
		
	}

	render() {
		// clear canvas
		this.cvs.attr({ width: this.width });
		
		if (this.debug.mode >= 2) {
			let bodies = Matter.Composite.allBodies(this.engine.world);

			this.ctx.save();
			this.ctx.lineWidth = 1;
			this.ctx.fillStyle = "#33669977";
			this.ctx.strokeStyle = "#113355cc";
			this.ctx.beginPath();
			bodies.map(body => {
				this.ctx.moveTo(body.vertices[0].x, body.vertices[0].y);
				body.vertices.slice(1).map(v => this.ctx.lineTo(v.x, v.y));
				this.ctx.lineTo(body.vertices[0].x, body.vertices[0].y);
			});
			this.ctx.fill();
			this.ctx.stroke();
			this.ctx.restore();
		}
		
		if (this.debug.mode >= 1) {
			this.drawFps(this.ctx);
		}
	}

	drawFps(ctx) {
		let fps = this.fpsControl ? this.fpsControl._log : [];
		ctx.save();
		ctx.translate(this.width - 109, this.height - 50);
		// draw box
		ctx.fillStyle = "#0006";
		ctx.fillRect(5, 5, 100, 40);
		ctx.fillStyle = "#fff4";
		ctx.fillRect(7, 7, 96, 11);
		ctx.fillStyle = "#fff6";
		// loop log
		for (let i=0; i<96; i++) {
			let bar = fps[i];
			if (!bar) break;
			let p = bar/90;
			if (p > 1) p = 1;
			ctx.fillRect(102 - i, 43, 1, -24 * p);
		}
		// write fps
		ctx.fillStyle = "#fff";
		ctx.font = "9px Arial";
		ctx.textAlign = "left";
		ctx.fillText('FPS: '+ fps[0], 8, 16);
		// restore state
		ctx.restore();
	}
}

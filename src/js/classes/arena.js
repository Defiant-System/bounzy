
class Arena {
	constructor(cfg) {
		let { canvas } = cfg;

		this.cvs = canvas;
		this.ctx = this.cvs[0].getContext("2d");
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		// set dimenstions
		this.cvs.attr({ width: this.width, height: this.height });
		// arena dimensions
		this.offset = { x: 49, y: 69, w: 390, h: 576 };

		this.colMasks = {
			default: 0x0001,
			monster: 0x0002,
			walls: 0x0003,
		};

		// physics engine
		this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 1 } });
		// create runner
		this.runner = Matter.Runner.create();
		// resolves physical world in this game scenario
		Matter.Resolver._restingThresh = 0.001;
		// event handler
		Matter.Events.on(this.engine, "collisionStart", this.handleCollision.bind(this));


		// entities array
		this.entities = [];
		// physical bodies
		this.bodies = [];

		// dev / debug purpose
		this.debug = {
			mode: 1,
		};

		// create FPS controller
		let Self = this;
		this.fpsControl = karaqu.FpsControl({
			fps: 60,
			callback(time, delta) {
				Matter.Runner.tick(Self.runner, Self.engine);
				Self.update(delta, time);
				Self.render();
			}
		});

		// assets list
		let assets = [
				{ id: "bosses", width: 1024, height: 1024, src: "~/gfx/bosses.webp" },
				{ id: "monsters", width: 1024, height: 1024, src: "~/gfx/monsters.png" },
				{ id: "shadow", width: 98, height: 125, src: "~/gfx/shadow.png" },
				{ id: "shield", width: 64, height: 41, src: "~/gfx/shield-sheet0.webp" },
				{ id: "ammo", width: 128, height: 128, src: "~/gfx/ammo.webp" },
				{ id: "arrows", width: 20, height: 1024, src: "~/icons/target-arrows.png" },
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
		// temp
		let level = [
				[0,0,0,0,0,0],
				[0,0,1,2,0,0],
				[0,0,0,0,0,0],
				[0,0,0,0,0,0],
				// [1,1,2,2,0,1],
				// [1,1,2,2,0,1],
				// [3,3,4,4,5,5],
				// [0,7,0,6,6,0],
			],
			asset = this.assets.monsters,
			shadow = this.assets.shadow;

		level.map((r, y) => {
			r.map((type, x) => {
				if (type > 0) {
					this.entities.push(new Monster({ parent: this, asset, shadow, type, x, y }));
				}
			});
		});
		// add wizard
		this.wizard = new Wizard({ parent: this, asset: this.assets.arrows });
		// set physical world (boundries, walls)
		this.setPhysicalWorld();
	}

	handleCollision(event) {
		event.pairs.map(pair => {
			let [a1, b1] = pair.bodyA.label.split("-"),
				[a2, b2] = pair.bodyB.label.split("-"),
				bBody = a1 === "bullet" ? pair.bodyA : (a2 === "bullet" ? pair.bodyB : null),
				mBody = a1 === "monster" ? pair.bodyA : (a2 === "monster" ? pair.bodyB : null);
			// console.log( pair.bodyA, pair.bodyB );
			if (bBody && mBody) {
				let bullet = this.entities.find(item => item.body.label === bBody.label),
					monster = this.entities.find(item => item.body.label === mBody.label);
				monster.dealDamage(bullet.damage);
			}
		});
	}

	setPhysicalWorld() {
		let thick = 30,
			opt = {
				isStatic: true,
				density: 1,
				mass: 0,
				collisionFilter: { category: this.colMasks.walls },
			};
		// add physical walls
		this.bodies.push(Matter.Bodies.rectangle((this.offset.w >> 1), -thick >> 1, thick + thick + this.offset.w, thick, opt));
		this.bodies.push(Matter.Bodies.rectangle(-thick >> 1, (this.offset.h >> 1), thick, this.offset.h, opt));
		this.bodies.push(Matter.Bodies.rectangle(this.offset.w + (thick >> 1), (this.offset.h >> 1), thick, this.offset.h, opt));

		// temp
		let bodies = [...this.bodies, ...this.entities.map(m => m.body)];

		// physics setup
		Matter.Composite.add(this.engine.world, bodies);
	}

	addEntity(item) {
		// add item body to physical world
		if (item.body) Matter.Composite.add(this.engine.world, item.body);
		// to be updated & rendered
		this.entities.push(item);
	}

	removeEntity(item) {
		// remove item body from physical world
		if (item.body) Matter.Composite.remove(this.engine.world, item.body);
		// stop update & render
		let index = this.entities.findIndex(e => e == item);
		this.entities.splice(index, 1);
	}

	update(delta, time) {
		// update all entities
		this.entities.map(item => item.update(delta, time));
		this.wizard.update(delta, time);
	}

	render() {
		// clear canvas
		this.cvs.attr({ width: this.width });

		this.ctx.save();
		this.ctx.translate(this.offset.x, this.offset.y);

		// render all entities
		this.entities.map(item => item.render(this.ctx));
		this.wizard.render(this.ctx);

		if (this.debug.mode >= 2) {
			// game arena
			// this.ctx.fillStyle = "#f003";
			// this.ctx.fillRect(0, 0, this.offset.w, this.offset.h);
			// physical bodies
			let bodies = Matter.Composite.allBodies(this.engine.world);
			this.ctx.save();
			this.ctx.lineWidth = 1;
			this.ctx.fillStyle = "#3697";
			this.ctx.strokeStyle = "#135c";
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
		this.ctx.restore();

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

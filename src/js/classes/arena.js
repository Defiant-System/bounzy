
class Arena {
	constructor(cfg) {
		let { parent, canvas } = cfg;

		this.APP = parent; // reference to "bounzy.game"
		this.cvs = canvas;
		this.ctx = this.cvs[0].getContext("2d");
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		// set dimenstions
		this.cvs.attr({ width: this.width, height: this.height });
		// arena dimensions
		this.offset = { x: 49, y: 69, w: 390, h: 576 };
		this.counters = {
			Monster: 0,
			Bullet: 0,
		};
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

		// level & stage
		this._level = 1;
		this.stage = [...Levels[this._level-1]];
		// entities array
		this.entities = [];
		// fx array
		this.fx = [];

		// dev / debug purpose
		this.debug = { mode: 1 };

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
				{ id: "bosses", width: 1300, height: 1300, src: "~/gfx/bosses.png" },
				{ id: "monsters", width: 1024, height: 1024, src: "~/gfx/monsters.png" },
				{ id: "shadow", width: 98, height: 125, src: "~/gfx/shadow.png" },
				{ id: "shield", width: 64, height: 41, src: "~/gfx/shield-sheet0.webp" },
				{ id: "ammo", width: 128, height: 128, src: "~/gfx/ammo.png" },
				{ id: "vortex", width: 128, height: 128, src: "~/gfx/vortex.png" },
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
		// add wizard
		this.wizard = new Wizard({ parent: this, asset: this.assets.arrows });
		// add wall
		this.wall = this.addEntity(new Wall({ parent: this }));
		// set physical world (boundries, walls)
		this.setPhysicalWorld();
		// add enemy line row
		// this.addRow(1);
		this.addRow(21, 19);
	}

	handleCollision(event) {
		event.pairs.map(pair => {
			let itemA = this.entities.find(e => e.body === pair.bodyA),
				itemB = this.entities.find(e => e.body === pair.bodyB);
			// bullet bounce
			if (itemA && itemA.type === "bullet") itemA.bounced(this.fpsControl._now);
			if (itemB && itemB.type === "bullet") itemB.bounced(this.fpsControl._now);

			if (!itemA || !itemB) return;

			let [a1, a2] = itemA.body.label.split("-"),
				[b1, b2] = itemA.body.label.split("-");

			if ((a1 === "bullet" && b1 === "shield") || (a2 === "bullet" && a1 === "shield")) {
				// sparks
				let { x, y } = pair.collision.supports[0];
				new Sparks({ parent: this, x, y });
			}

			if (itemA.type === "bullet" && itemB.type === "brick") {
				itemB.dealDamage(itemA.damage);
				// sparks
				let { x, y } = pair.collision.supports[0];
				new Sparks({ parent: this, x, y });
			}

			if (itemA.type === "brick" && itemB.type === "bullet") {
				itemA.dealDamage(itemB.damage);
				// sparks
				let { x, y } = pair.collision.supports[0];
				new Sparks({ parent: this, x, y });
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
			},
			bodies = [];
		// add physical walls
		bodies.push(Matter.Bodies.rectangle((this.offset.w >> 1), -thick >> 1, thick + thick + this.offset.w, thick, opt));
		bodies.push(Matter.Bodies.rectangle(-thick >> 1, (this.offset.h >> 1), thick, this.offset.h, opt));
		bodies.push(Matter.Bodies.rectangle(this.offset.w + (thick >> 1), (this.offset.h >> 1), thick, this.offset.h, opt));

		// physics setup
		Matter.Composite.add(this.engine.world, bodies);
	}

	endAttack() {
		console.log("end attack");
		this.entities
			.filter(item => item.body && item.body.label.startsWith("bullet-"))
			.map(item => item.kill(true));


		if (this.counters.Monster <= 0 && !this.stage.length) {
			// this.APP.dispatch({ type: "open-dialog", arg: "reward", addClass: "completed" });
		} else {
			// move monsters one step down
			this.advance();
		}
	}

	addRow(to=1, from=0) {
		// if empty, the boss is deployed - no more rows
		if (!this.stage.length) return;

		// discard rows
		[...Array(from)].map(n => this.stage.shift());

		// add rows
		for (let y=from; y<to; y++) {
			// add new row
			let row = this.stage.shift();
			row.map((c, x) => {
				let [s, type] = c.split(""),
					hasShield = s === "s";
				if (type > 0) {
					if (s === "b") new Boss({ parent: this, hasShield, type, x, y: y-from });
					else new Monster({ parent: this, hasShield, type, x, y: y-from });
				}
			});
		}
		// update waves indicator
		this.APP.game.dispatch({ type: "set-attack-wave", num: 21-this.stage.length });
	}

	advance() {
		if (this.wizard._state === "ready") return;
		console.log("advance");
		// drop down
		this.entities
			.filter(item => item.type === "brick")
			.map(item => item.advance());
		// add enemy line row
		this.addRow();
		// wizard can aim/fire again
		this.wizard.reloadAim();
		// move wizard
		this.APP.game.dispatch({ type: "move-wizard" });
	}

	addEntity(item) {
		// add item body to physical world
		if (item.body) Matter.Composite.add(this.engine.world, item.body);
		if (item.shield) Matter.Composite.add(this.engine.world, item.shield);
		// to be updated & rendered
		if (item._fx) this.fx.push(item);
		else this.entities.push(item);
		// keep track of items
		let name = item.constructor.name;
		if (name === "Boss") name = "Monster";
		if (this.counters[name] !== undefined) this.counters[name]++;
		// return entity
		return item;
	}

	removeEntity(item) {
		// remove item body from physical world
		if (item.body) Matter.Composite.remove(this.engine.world, item.body);
		if (item.shield) Matter.Composite.remove(this.engine.world, item.shield);
		// stop update & render
		if (item._fx) {
			let index = this.fx.findIndex(e => e == item);
			this.fx.splice(index, 1);
		} else {
			setTimeout(() => {
				let index = this.entities.findIndex(e => e == item);
				this.entities.splice(index, 1);

				if (this.counters.Monster == 0) {
					// kill all bullets
					if (this.counters.Bullet > 0) this.endAttack();
					// keep track of bullets
					else if (this.counters.Bullet == 0) {
						// move monsters one step down
						this.advance();
					}
				} else {
					if (this.counters.Bullet == 0) {
						// move monsters one step down
						this.advance();
					}
				}
			});
		}
		// keep track of items
		let name = item.constructor.name;
		if (name === "Boss") name = "Monster";
		if (this.counters[name] !== undefined) this.counters[name]--;
	}

	update(delta, time) {
		// update all entities
		this.entities.map(item => item.update(delta, time));
		this.wizard.update(delta, time);
		this.fx.map(item => item.update(delta, time));
	}

	render() {
		// clear canvas
		this.cvs.attr({ width: this.width });
		// redraw arena
		this.ctx.save();
		this.ctx.translate(this.offset.x, this.offset.y);

		// render all entities
		this.entities.map(item => item.render(this.ctx));
		this.wizard.render(this.ctx);
		this.fx.map(item => item.render(this.ctx));

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

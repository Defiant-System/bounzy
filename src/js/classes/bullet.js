
class Bullet {
	constructor(cfg) {
		let { parent, start, target, angle, damage, uI } = cfg;

		this.parent = parent;
		this.position = start;
		this.type = "bullet";
		this.target = target;
		this.angle = angle;
		this.bottom = this.parent.offset.h;
		this.armed = false;
		this._bounced = 0;
		this.radius = 8;

		let tailMap = {
				blue: { sX: 1, sY: 123, w: 35, h: 17, oX: -41, oY: -8 },
				purple: { sX: 10, sY: 141, w: 35, h: 17, oX: -41, oY: -8 },
			},
			ammoMap = {
				b0: { sX:  1, sY: 59, w: 28, h: 18, oX: -19, oY: -9 },
				b1: { sX: 31, sY: 59, w: 28, h: 18, oX: -19, oY: -9 },
				b2: { sX: 61, sY: 59, w: 28, h: 18, oX: -19, oY: -9 },
				b3: { sX: 91, sY: 59, w: 28, h: 18, oX: -19, oY: -9 },
				b4: { sX:  1, sY: 81, w: 28, h: 18, oX: -19, oY: -9 },
				b5: { sX: 31, sY: 81, w: 28, h: 18, oX: -19, oY: -9 },
				b6: { sX: 61, sY: 81, w: 28, h: 18, oX: -19, oY: -9 },
				b7: { sX: 91, sY: 81, w: 28, h: 18, oX: -19, oY: -9 },
				b8: { sX:  1, sY: 103, w: 28, h: 18, oX: -19, oY: -9 },
				b9: { sX: 31, sY: 103, w: 28, h: 18, oX: -19, oY: -9 },
			},
			{ sX, sY, w, h, oX, oY } = ammoMap[uI];

		this.damage = damage;
		this.vortex = parent.assets.vortex.img;
		this.asset = parent.assets.ammo.img;
		this.sX = sX;
		this.sY = sY;
		this.oX = oX;
		this.oY = oY;
		this.w = w;
		this.h = h;
		// color of the bullet tail
		this.tail = "b5 b6 b7 b8 b9".includes(uI) ? tailMap.purple : tailMap.blue;

		let opt = {
				restitution: 1,
				frictionAir: 0,
				friction: 0,
				inertia: Infinity,
				mass: 0,
				label: "bullet-"+ Date.now(),
				collisionFilter: { mask: parent.colMasks.monster },
			};
		this.body = Matter.Bodies.circle(this.position.x, this.position.y, this.radius, opt);

		// add to map entries
		this.parent.addEntity(this);
		
		let speed = 8,
			vX = Math.cos(angle) * speed,
 			vY = Math.sin(angle) * speed;
		this.force = new Point(vX, vY);

		// set velocity
		Matter.Body.setVelocity(this.body, this.force);
	}

	bounced(time) {
		// turns "off" tail shortly - otherwise it appears beyond wall for instance
		this._bounced = time + 150;
	}

	kill(anim) {
		if (anim) {
			let parent = this.parent,
				x = this.position.x,
				y = this.position.y;
			new Die({ parent, type: "vortex", x, y });
		}
		// remove this from game loop
		this.parent.removeEntity(this);
	}

	update(delta, time) {
		// calculate bullet angle
		this.angle = this.position.direction(this.body.position);
		// tail logic
		this._tail = this._bounced - time < 0;
		// copy physical position to "this" internal position
		this.position.x = this.body.position.x;
		this.position.y = this.body.position.y;
		// logic handling "birth" & "death" of bullet
		if (!this.armed && this.position.y < this.bottom) this.armed = true;
		else if (this.armed && this.position.y >= this.bottom) this.kill();
	}

	render(ctx) {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.angle);
		// tail
		if (this._tail) {
			ctx.drawImage(this.asset, this.tail.sX, this.tail.sY, this.tail.w, this.tail.h, this.tail.oX, this.tail.oY, this.tail.w, this.tail.h);
		}
		// bullet
		ctx.drawImage(this.asset, this.sX, this.sY, this.w, this.h, this.oX, this.oY, this.w, this.h);
		ctx.restore();
	}
}


class Bullet {
	constructor(cfg) {
		let { parent, start, target, angle } = cfg;

		this.parent = parent;
		this.position = start;
		this.target = target;
		this.radius = 10;

		let opt = {
			restitution: 1,
			frictionAir: 0,
			friction: 0,
			inertia: Infinity,
			density: 1e-10,
			mass: 0,
		};
		this.body = Matter.Bodies.circle(this.position.x, this.position.y, this.radius, opt);

		// add to map entries
		this.parent.addEntity(this);
		
		let speed = opt.density,
			vX = Math.cos(angle) * speed,
 			vY = Math.sin(angle) * speed;
		this.force = new Point(vX, vY);
		// this.force = this.body.mass * .007;
	}

	update(delta, time) {
		let force = this.force.setMagnitude(delta/50);
		Matter.Body.applyForce(this.body, this.body.position, force);
		
		// copy physical position to "this" internal position
		this.position.x = this.body.position.x;
		this.position.y = this.body.position.y;
	}

	render(ctx) {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		// target point
		ctx.fillStyle = "#f00";
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.TAU);
		ctx.fill();
		ctx.restore();
	}
}

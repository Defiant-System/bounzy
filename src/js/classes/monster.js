
class Monster {
	constructor(cfg) {
		let { canvas } = cfg;

	}

	update(delta, time) {
		
	}

	render(ctx) {
		ctx.save();
		ctx.translate(0, 0);
		ctx.fillStyle = "#f005";
		
		ctx.fillRect(0, 0, 65, 65);
		ctx.fillRect(65, 65, 65, 65);

		ctx.restore();
	}
}

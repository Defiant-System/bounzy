
class Monster {
	constructor(cfg) {
		let { canvas } = cfg;

	}

	update(delta, time) {
		
	}

	render(ctx) {
		let w = 65,
			h = 65;
		ctx.save();
		ctx.translate(0, 0);
		ctx.fillStyle = "#f005";

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

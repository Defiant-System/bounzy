
// bounzy.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="game"]`),
			canvas: window.find(`div[data-area="game"] canvas`),
		};
		// instantiate arena
		this.arena = new Arena({ canvas: this.els.canvas });
		// bind event handlers
		this.els.canvas.on("mousedown", this.doAim);
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.game,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				Self.dispatch({ type: "start-game" });
				break;
			case "exit-view":
				Self.dispatch({ type: "pause-game", dialog: "none" });
				break;
			case "start-game":
			case "resume-game":
				if (Self._gameState === "started") return;
				Self.arena.fpsControl.start();
				Self._gameState = "started";
				break;
			case "pause-game":
				if (!event.dialog) {
					APP.dispatch({ type: "open-dialog", arg: "pause" });
				}
				Self.arena.fpsControl.stop();
				Self._gameState = "paused";
				break;
			case "resume-if-started":
				if (Self._gameState === "paused") Self.dispatch({ type: "resume-game" });
				break;
			case "pause-if-started":
				if (Self._gameState === "started") Self.dispatch({ type: "pause-game" });
				break;
		}
	},
	doAim(event) {
		let APP = bounzy,
			Self = APP.game,
			Drag = Self.drag;
		switch (event.type) {
			// pan stadium
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let doc = $(document),
					cvs = Self.els.canvas,
					offset = {
						y: event.offsetY,
						x: event.offsetX,
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					};

				// drag info
				Self.drag = { doc, cvs, click, offset };
				// bind event handlers
				Self.drag.doc.on("mousemove mouseup", Self.doAim);
				break;
			case "mousemove":
				let y = Drag.offset.y - (event.clientY - Drag.click.y),
					x = Drag.offset.x - (event.clientX - Drag.click.x);
				// Drag.arena.stadium.ball.body.position.y = y;
				// Drag.arena.stadium.ball.body.position.x = x;
				break;
			case "mouseup":
				// unbind event handlers
				Self.drag.doc.off("mousemove mouseup", Self.doAim);
				break;
		}
	}
}


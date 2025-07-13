
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
			case "set-debug-mode":
				Self.arena.debug.mode = event.arg;
				break;
			case "start-game":
				let magasin = [];
				magasin.push(...APP.settings.wizard.laboratory.front);
				magasin.push(...APP.settings.wizard.laboratory.back);
				Self.arena.wizard.setMagasin(magasin);
				/* falls through */
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
				// exit on contextmenu
				if (event.button == 2 || Self.arena.fpsControl._stopped) return;

				// prevent default behaviour
				event.preventDefault();

				let doc = $(document),
					cvs = Self.els.canvas,
					wizard = Self.arena.wizard,
					offset = {
						y: event.clientY - event.offsetY + Self.arena.offset.y,
						x: event.clientX - event.offsetX + Self.arena.offset.x,
					};

				// drag info
				Self.drag = { doc, cvs, wizard, offset };
				// bind event handlers
				Self.drag.doc.on("mousemove mouseup", Self.doAim);
				break;
			case "mousemove":
				let y = event.clientY - Drag.offset.y,
					x = event.clientX - Drag.offset.x;
				Drag.wizard.setMouse(x, y);
				break;
			case "mouseup":
				// unbind event handlers
				Self.drag.doc.off("mousemove mouseup", Self.doAim);
				// fire bullets
				Drag.wizard.shoot();
				break;
		}
	}
}


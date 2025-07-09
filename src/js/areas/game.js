
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
	}
}


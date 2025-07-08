
// bounzy.pause

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="pause"]`),
		};
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.pause,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				APP.game.dispatch({ type: "pause-game" });
				break;
			case "resume-game":
				APP.dispatch({ type: "close-dialog" });
				APP.game.dispatch({ type: "resume-game" });
				break;
			case "go-to-start":
				APP.dispatch({ type: "show-view", arg: "start" });
				setTimeout(() => APP.dispatch({ type: "close-dialog" }), 100);
				break;
		}
	}
}


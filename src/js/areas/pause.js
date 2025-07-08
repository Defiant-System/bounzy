
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
				break;
			case "resume-game":
				APP.dispatch({ type: "close-dialog" });
				break;
			case "go-to-start":
				APP.dispatch({ type: "close-dialog" });
				APP.dispatch({ type: "show-view", arg: "start" });
				break;
		}
	}
}


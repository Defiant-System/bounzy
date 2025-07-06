
// bounzy.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="game"]`),
		};
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
				break;
		}
	}
}


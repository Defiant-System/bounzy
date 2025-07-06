
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
		}
	}
}


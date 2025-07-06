
// bounzy.start

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="start"]`),
		};
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.start,
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



// bounzy.wall

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="wall"]`),
		};
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.wall,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				break;
			case "upgrade-wall":
				if (!event.el.hasClass("active")) return;
				console.log(event);
				break;
		}
	}
}


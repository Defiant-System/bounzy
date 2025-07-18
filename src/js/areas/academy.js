
// bounzy.academy

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="academy"]`),
		};
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.academy,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				break;
			case "upgrade-frontline":
			case "upgrade-backline":
			case "upgrade-potion":
			case "upgrade-comet":
				if (!event.el.hasClass("active")) return;
				console.log(event);
				break;
		}
	}
}


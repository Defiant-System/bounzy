
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
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				break;
			case "toggle-settings":
				el = Self.els.el.find(".settings");
				el.toggleClass("show", el.hasClass("show"));
				break;
		}
	}
}



// bounzy.reward

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="reward"]`),
			coins: window.find(`.top-bar .coins`),
			jems: window.find(`.top-bar .jems`),
		};
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.reward,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				break;
			case "get-rewards":
				value = +Self.els.coins.text() + +Self.els.el.find(".coins").text();
				Self.els.coins.html(value);
				value = +Self.els.jems.text() + +Self.els.el.find(".jems").text();
				Self.els.jems.html(value);
				// start timer again
				APP.start.dispatch({ type: "start-timer" });
				// close dialog
				APP.dispatch({ type: "close-dialog" });
				break;
		}
	}
}


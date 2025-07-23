
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
			total,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				break;
			case "get-rewards":
				// ticker animation
				value = +Self.els.coins.text();
				total = value + +Self.els.el.find(".coins").text();
				Self.els.coins
					.css({ "--value": value, "--total": total })
					.cssSequence("ticker", "animationend", el => el.html(el.cssProp("--total")).removeClass("ticker"));

				// ticker animation
				value = +Self.els.jems.text();
				total = value + +Self.els.el.find(".jems").text();
				Self.els.jems
					.css({ "--value": value, "--total": total })
					.cssSequence("ticker", "animationend", el => el.html(el.cssProp("--total")).removeClass("ticker"));

				// start timer again
				APP.start.dispatch({ type: "start-timer" });
				// close dialog
				APP.dispatch({ type: "close-dialog" });
				break;
		}
	}
}


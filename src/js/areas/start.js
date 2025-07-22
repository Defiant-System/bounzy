
// bounzy.start

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="start"]`),
			chest: window.find(`div[data-area="start"] .chest`),
			timer: window.find(`div[data-area="start"] .chest .timer`),
		};
		// start timer
		this.dispatch({ type: "start-timer" });
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
			case "show-reward-dialog":
				if (Self.els.chest.hasClass("ready")) {
					APP.dispatch({ type: "open-dialog", arg: "reward" });
				}
				break;
			case "start-timer":
				// reset chest
				Self.els.chest.removeClass("ready");
				// start timer
				Self.els.timer.cssSequence("started", "transitionend", el => {
					// stop / reset timer
					el.removeClass("started").css({ "--tM": 3, "--tS": 30 });
					// chest can be opened
					Self.els.chest.addClass("ready");
				});
				break;
		}
	}
}


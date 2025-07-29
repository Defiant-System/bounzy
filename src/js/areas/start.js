
// bounzy.start

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="start"]`),
			topbar: window.find(`content .top-bar`),
			chest: window.find(`div[data-area="start"] .chest`),
			timer: window.find(`div[data-area="start"] .chest .timer`),
		};
		// start timer
		this.dispatch({ type: "start-timer" });
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.start,
			level,
			coins,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				Self.dispatch({ type: "update-upgrade-buttons" });
				break;
			case "update-upgrade-buttons":
				// check level and coins and what player can afford
				level = +Self.els.topbar.find(".level").text();
				coins = +Self.els.topbar.find(".coins").text();
				// check dialogs:
				["wall", "academy", "laboratory"].map(dialog => {
					// check dialog buttons
					APP[dialog].els.el.find(".price[data-click]").map(elem => {
						let btnEl = $(elem),
							canAfford = +btnEl.text() >= coins,
							canBuy = (+btnEl.data("level") || 1) <= level;
						// toggle button class
						btnEl.toggleClass("disabled", canBuy);
						btnEl.toggleClass("active", canAfford);
						// toggle upgrade on dialog opener
						Self.els.el.find(`div[data-click="open-dialog"][data-arg="${dialog}"]`)
							.toggleClass("ready", canBuy || canAfford);
					});
				});
				break;
			case "toggle-settings":
				el = Self.els.el.find(".settings");
				el.toggleClass("show", el.hasClass("show"));
				break;
			case "show-reward-dialog":
				if (Self.els.chest.hasClass("ready")) {
					// reset chest
					Self.els.chest.removeClass("ready");
					// open dialog
					APP.dispatch({ type: "open-dialog", arg: "reward" });
				}
				break;
			case "start-timer":
				// start timer
				Self.els.timer.cssSequence("started", "transitionend", el => {
					// stop / reset timer
					el.removeClass("started").css({ "--tM": 2, "--tS": 30 });
					// chest can be opened
					Self.els.chest.addClass("ready");
				});
				break;
		}
	}
}


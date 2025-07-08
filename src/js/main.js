
@import "./modules/test.js"


const bounzy = {
	init() {
		// fast references
		this.content = window.find("content");

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = bounzy,
			val,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "show-view":
				Self[event.arg].dispatch({ type: "init-view" });

				val = event.arg == "game" ? "start-to-game" : "game-to-start";
				Self.content.cssSequence(val, "transitionend", el => {
					el.data({ show: event.arg }).removeClass(val);
				});
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			case "open-dialog":
				if (event.addClass) Self.content.find(`div[data-area="${event.arg}"]`).addClass(event.addClass);
				Self.content.data({ dialog: event.arg });
				Self.content.cssSequence("open-dialog", "transitionend", el => {
					// TODO ?
				});
				break;
			case "close-dialog":
				Self.content.removeAttr("data-dialog");
				Self.content.cssSequence("!open-dialog", "transitionend", el => {
					// reset dialog class
					el.find(`div[data-area]`).removeAttr("class");
				});
				break;
			case "empty-close-dialog":
				el = $(event.target);
				if (el.data("area")) Self.dispatch({ type: "close-dialog" });
				break;
			// proxy events
			default:
				el = event.el;
				if (!el && event.origin) el = event.origin.el;
				if (el) {
					let pEl = el.parents(`?div[data-area]`);
					if (!pEl.length) pEl = Self.content;
					if (pEl.length) {
						let name = pEl.data("area");
						if (!name) name = pEl.data("show");
						return Self[name].dispatch(event);
					}
				} else if (Self.active) {
					Self[Self.active].dispatch(event);
				}
		}
	},
	start: @import "./areas/start.js",
	laboratory: @import "./areas/laboratory.js",
	academy: @import "./areas/academy.js",
	pause: @import "./areas/pause.js",
	game: @import "./areas/game.js",
};

window.exports = bounzy;

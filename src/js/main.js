
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
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "show-view":
				Self.content.data({ show: event.arg });
				Self[event.arg].dispatch({ type: "init-view" });
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
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

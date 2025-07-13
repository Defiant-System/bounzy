

@import "./classes/arena.js"
@import "./classes/wizard.js"
@import "./classes/boss.js"
@import "./classes/monster.js"
@import "./classes/bullet.js"
@import "./classes/ray.js"
@import "./classes/vec2.js"
@import "./classes/point.js"
@import "./classes/sparks.js"

@import "./ext/matter.min.js"
@import "./ext/pathseg.js"

@import "./modules/levels.js"
@import "./modules/utils.js"
@import "./modules/test.js"


const Matter = window.Matter;


// default settings
const defaultSettings = {
	"music": "on",
	"sound-fx": "on",
	"state": {
		level: 1,
		shield: 10,
		coins: 400,
		jems: 5,
		waves: {
			num: 16,
			chest: "unlocked",
		},
		academy: {
			front: { damage: 80, price: 525 },
			back:  { damage: 30, price: 525 },
			potion: { damage: 50, price: 450 },
			comet: { damage: 100, price: 450 },
		},
		laboratory: {
			front: [
				{ damage: 15, uI: "b1" },
				{ damage: 15, uI: "b1" },
			],
			back: [
				{ damage: 15, uI: "b0" },
				{ damage: 15, uI: "b0" },
			]
		},
	},
};


const bounzy = {
	init() {
		// fast references
		this.content = window.find("content");

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// init settings
		this.dispatch({ type: "init-settings" });

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
			case "window.focus":
				Self.game.dispatch({ type: "resume-if-started" });
				break;
			case "window.blur":
				Self.game.dispatch({ type: "pause-if-started" });
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			case "show-view":
				// exit active view, if any
				if (Self._activeView) Self[Self._activeView].dispatch({ type: "exit-view" });
				// active view init
				Self[event.arg].dispatch({ type: "init-view" });
				Self._activeView = event.arg;

				val = event.arg == "game" ? "start-to-game" : "game-to-start";
				Self.content.cssSequence(val, "transitionend", el => {
					el.data({ show: event.arg }).removeClass(val);
				});
				break;
			case "init-settings":
				// get settings, if any
				Self.settings = window.settings.getItem("settings") || defaultSettings;
				// settings
				["music", "sound-fx"].map(e => {
					let value = Self.settings[e] === "on";
					Self.dispatch({ type: `toggle-${e}`, value });
				});
				// restore state
				Self.game.dispatch({ type: "restore-state" });
				break;
			case "toggle-music":
			case "toggle-sound-fx":
				// TODO
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

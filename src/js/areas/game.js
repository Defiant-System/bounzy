
// bounzy.game

{
	init() {
		// fast references
		this.els = {
			content: window.find(`content`),
			el: window.find(`div[data-area="game"]`),
			canvas: window.find(`div[data-area="game"] canvas`),
		};
		// instantiate arena
		this.arena = new Arena({ canvas: this.els.canvas });
		// bind event handlers
		this.els.canvas.on("mousedown", this.doAim);
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.game,
			data,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				Self.dispatch({ type: "start-game" });
				break;
			case "exit-view":
				Self.dispatch({ type: "pause-game", dialog: "none" });
				break;
			case "set-debug-mode":
				Self.arena.debug.mode = event.arg;
				break;
			case "restore-state":
				// top bar
				Self.els.content.find(`.top-bar .shield`).html(APP.settings.state.shield);
				Self.els.content.find(`.top-bar .level`).html(APP.settings.state.level);
				Self.els.content.find(`.top-bar .coins`).html(APP.settings.state.coins);
				Self.els.content.find(`.top-bar .jems`).html(APP.settings.state.jems);

				// dialog laboratory
				Self.els.content.find(`.bg-laboratory .info.front .value`).html(APP.settings.state.laboratory.front.damage);
				Self.els.content.find(`.bg-laboratory .info.front .price`).html(APP.settings.state.laboratory.front.price);
				Self.els.content.find(`.bg-laboratory .front-ammo`).data({
					on: APP.settings.state.laboratory.front.length,
					lvl: APP.settings.state.laboratory.front.level,
				});

				Self.els.content.find(`.bg-laboratory .info.back .value`).html(APP.settings.state.laboratory.back.damage);
				Self.els.content.find(`.bg-laboratory .info.back .price`).html(APP.settings.state.laboratory.back.price);
				Self.els.content.find(`.bg-laboratory .back-ammo`).data({
					on: APP.settings.state.laboratory.back.length,
					lvl: APP.settings.state.laboratory.back.level,
				});

				value = 0;
				value += APP.settings.state.laboratory.front.length * APP.settings.state.laboratory.front.damage;
				value += APP.settings.state.laboratory.back.length * APP.settings.state.laboratory.back.damage;
				Self.els.content.find(`.bg-laboratory .total span`).html(value);

				Self.dispatch({ type: "set-wizard-magasin" });
				break;
			case "set-wizard-magasin":
				if (Self.arena.wizard) {
					let magasin = [];
					[...Array(APP.settings.state.laboratory.front.length)].map(i => {
						magasin.push({
							damage: APP.settings.state.laboratory.front.damage,
							uI: "b"+ APP.settings.state.laboratory.front.level,
						});
					});
					[...Array(APP.settings.state.laboratory.back.length)].map(i => {
						magasin.push({
							damage: APP.settings.state.laboratory.back.damage,
							uI: "b"+ APP.settings.state.laboratory.back.level,
						});
					});
					Self.arena.wizard.setMagasin(magasin);
				}
				break;
			case "start-game":
				Self.dispatch({ type: "set-wizard-magasin" });
				/* falls through */
			case "resume-game":
				if (Self._gameState === "started") return;
				Self.arena.fpsControl.start();
				Self._gameState = "started";
				break;
			case "pause-game":
				if (!event.dialog) {
					APP.dispatch({ type: "open-dialog", arg: "pause" });
				}
				Self.arena.fpsControl.stop();
				Self._gameState = "paused";
				break;
			case "resume-if-started":
				if (Self._gameState === "paused") Self.dispatch({ type: "resume-game" });
				break;
			case "pause-if-started":
				if (Self._gameState === "started") Self.dispatch({ type: "pause-game" });
				break;
		}
	},
	doAim(event) {
		let APP = bounzy,
			Self = APP.game,
			Drag = Self.drag;
		switch (event.type) {
			// pan stadium
			case "mousedown":
				// exit on contextmenu
				if (event.button == 2 || Self.arena.fpsControl._stopped) return;

				// prevent default behaviour
				event.preventDefault();

				let doc = $(document),
					cvs = Self.els.canvas,
					wizard = Self.arena.wizard,
					offset = {
						y: event.clientY - event.offsetY + Self.arena.offset.y,
						x: event.clientX - event.offsetX + Self.arena.offset.x,
					};

				// drag info
				Self.drag = { doc, cvs, wizard, offset };
				// bind event handlers
				Self.drag.doc.on("mousemove mouseup", Self.doAim);
				break;
			case "mousemove":
				let y = event.clientY - Drag.offset.y,
					x = event.clientX - Drag.offset.x;
				Drag.wizard.setMouse(x, y);
				break;
			case "mouseup":
				// unbind event handlers
				Self.drag.doc.off("mousemove mouseup", Self.doAim);
				// fire bullets
				Drag.wizard.shoot();
				break;
		}
	}
}



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
		this.arena = new Arena({ parent: bounzy, canvas: this.els.canvas });
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
			case "end-attack":
				Self.arena.endAttack();
				break;
			case "set-attack-wave":
				Self.els.content.find(`.top-bar .waves`).css({ "--wave": event.num });
				break;
			case "unlock-chest":
				Self.els.content.find(`.top-bar .waves .marker-chest`).addClass("unlocked");
				break;
			case "restore-state":
				// top bar
				Self.els.content.find(`.top-bar .shield`).html(APP.settings.state.shield);
				Self.els.content.find(`.top-bar .level`).html(APP.settings.state.level);
				Self.els.content.find(`.top-bar .coins`).html(APP.settings.state.coins);
				Self.els.content.find(`.top-bar .jems`).html(APP.settings.state.jems);
				// dialog laboratory: front
				data = APP.settings.state.laboratory.front;
				Self.els.content.find(`.bg-laboratory .info.front .value`).html(data.damage);
				Self.els.content.find(`.bg-laboratory .info.front .price`)
					.toggleClass("active", data.price > APP.settings.state.coins)
					.html(data.price);
				Self.els.content.find(`.bg-laboratory .front-ammo`).data({
					on: data.length,
					lvl: data.level,
				});
				// dialog laboratory: back
				data = APP.settings.state.laboratory.back;
				Self.els.content.find(`.bg-laboratory .info.back .value`).html(data.damage);
				Self.els.content.find(`.bg-laboratory .info.back .price`)
					.toggleClass("active", data.price > APP.settings.state.coins)
					.html(data.price);
				Self.els.content.find(`.bg-laboratory .back-ammo`).data({
					on: data.length,
					lvl: data.level,
				});
				// dialog laboratory: total
				value = 0;
				value += APP.settings.state.laboratory.front.length * APP.settings.state.laboratory.front.damage;
				value += APP.settings.state.laboratory.back.length * APP.settings.state.laboratory.back.damage;
				Self.els.content.find(`.bg-laboratory .total span`).html(value);

				// game view: left side
				Self.els.el.find(`.line-damage`).html(value);

				data = APP.settings.state.academy.front;
				Self.els.el.find(`.front-damage`).html(data.damage);

				data = APP.settings.state.academy.back;
				Self.els.el.find(`.back-damage`).html(data.damage);

				// dialog academy
				Self.els.content.find(`.bg-academy .box.front .value`).html(APP.settings.state.academy.front.damage);
				el = Self.els.content.find(`.bg-academy .box.front .price`);
				data = APP.settings.state.academy.front;
				if (data.disabled) el.addClass("disabled").removeClass("active").html(data.disabled);
				else el.removeClass("disabled").toggleClass("active", data.price > APP.settings.state.coins).html(data.price);

				Self.els.content.find(`.bg-academy .box.back .value`).html(APP.settings.state.academy.back.damage);
				el = Self.els.content.find(`.bg-academy .box.back .price`);
				data = APP.settings.state.academy.back;
				if (data.disabled) el.addClass("disabled").removeClass("active").html(data.disabled);
				else el.removeClass("disabled").toggleClass("active", data.price > APP.settings.state.coins).html(data.price);

				Self.els.content.find(`.bg-academy .box.potion .value`).html(APP.settings.state.academy.potion.damage);
				el = Self.els.content.find(`.bg-academy .box.potion .price`);
				data = APP.settings.state.academy.potion;
				if (data.disabled) el.addClass("disabled").removeClass("active").html(data.disabled);
				else el.removeClass("disabled").toggleClass("active", data.price > APP.settings.state.coins).html(data.price);

				Self.els.content.find(`.bg-academy .box.comet .value`).html(APP.settings.state.academy.comet.damage);
				el = Self.els.content.find(`.bg-academy .box.comet .price`);
				data = APP.settings.state.academy.comet;
				if (data.disabled) el.addClass("disabled").removeClass("active").html(data.disabled);
				else el.removeClass("disabled").toggleClass("active", data.price > APP.settings.state.coins).html(data.price);

				// dialog wall
				Self.els.content.find(`.bg-wall .info .value`).html(APP.settings.state.wall.level);
				Self.els.content.find(`.bg-wall .info .price`)
					.toggleClass("active", APP.settings.state.wall.price > APP.settings.state.coins)
					.html(APP.settings.state.wall.price);

				// update wizard magasin
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


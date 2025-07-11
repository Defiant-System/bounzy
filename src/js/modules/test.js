
let Test = {
	init(APP) {
		// APP.dispatch({ type: "show-view", arg: "game" });
		// APP.dispatch({ type: "open-dialog", arg: "reward", addClass: "completed" });

		setTimeout(() => APP.dispatch({ type: "show-view", arg: "game" }), 500);
		setTimeout(() => APP.game.arena.fpsControl.stop(), 5000);
		// setTimeout(() => APP.game.dispatch({ type: "pause-game" }), 3000);

		// setTimeout(() => APP.dispatch({ type: "show-view", arg: "game" }), 1000);
		// setTimeout(() => APP.dispatch({ type: "show-view", arg: "start" }), 4000);

		// setTimeout(() => {
		// 	APP.content.find(".marker-chest").cssSequence("on", "transitionend", el => {
		// 		// el.removeClass("on");
		// 	});
		// }, 500);
	}
};

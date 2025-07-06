
// bounzy.laboratory

{
	init() {
		// fast references
		this.els = {
			el: window.find(`div[data-area="laboratory"]`),
		};
	},
	async dispatch(event) {
		let APP = bounzy,
			Self = APP.laboratory,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "init-view":
				break;
			case "upgrade-frontline":
				Self.els.el.find(`.ammo .front-ammo`).cssSequence("upgrade", "transitionend", el => {
					el.removeClass("upgrade");
				});
				break;
			case "upgrade-backline":
				Self.els.el.find(`.ammo .back-ammo`).cssSequence("upgrade", "transitionend", el => {
					el.removeClass("upgrade");
				});
				break;
		}
	}
}


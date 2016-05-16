"use strict";

import AmpersandView from "ampersand-view";
import PieceView from "./piece_thumbnail";

export default AmpersandView.extend({
	template: (
		`<article class="a_series">
			<header>
				<a href="/" title="close">×</a>
				<h2 data-hook="series-title"></h2>
			</header>
			<section data-hook="pieces-grid"></section>
		</article>`
	),
	render() {
		this.renderWithTemplate(this);

		this.renderCollection(this.model.pieces, PieceView, this.queryByHook("pieces-grid"));

		return this;
	},
	bindings: {
		"model.title": {
			type: "text",
			hook: "series-title"
		}
	}
});

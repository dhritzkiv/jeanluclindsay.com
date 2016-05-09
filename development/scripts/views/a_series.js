"use strict";

const AmpersandView = require("ampersand-view");
const PieceView = require("./piece_thumbnail");

module.exports = AmpersandView.extend({
	template: (
		`<article class="a_series">
			<header>
				<a href="/" title="close">×</a>
				<h2 data-hook="series-title"></h2>
			</header>
			<section data-hook="pieces-grid"></section>
		</article>`
	),
	render: function() {
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
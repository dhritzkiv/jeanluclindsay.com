"use strict";

const AmpersandView = require("ampersand-view");

module.exports = AmpersandView.extend({
	template: (
		`<article class="piece thumbnail">
			<figure>
				<img>
			</figure>
			<h2 data-hook="title"></h2>
			<h3 data-hook="materials"></h3>
			<h3 data-hook="year"></h3>
		</article>`
	),
	bindings: {
		"model.title": {
			type: "text",
			hook: "title"
		},
		"model.materials": {
			type: "text",
			hook: "materials"
		},
		"model.year": {
			type: "text",
			hook: "year"
		},
		"model.first_image_uri": {
			type: "attribute",
			name: "src",
			selector: "img"
		}
	}
});
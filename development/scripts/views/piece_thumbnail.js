"use strict";

const AmpersandView = require("ampersand-view");

module.exports = AmpersandView.extend({
	template: (
		`<article class="piece thumbnail">
			<a>
				<figure>
					<img>
				</figure>
				<h2 data-hook="title"></h2>
				<h3 data-hook="materials"></h3>
				<h3 data-hook="year"></h3>
			</a>
		</article>`
	),
	bindings: {
		"model.widowless_title": {
			type: "text",
			hook: "title"
		},
		"model.widowless_materials": {
			type: "text",
			hook: "materials"
		},
		"model.year": {
			type: "text",
			hook: "year"
		},
		"model.first_image_thumbnail_uri": {
			type: "attribute",
			name: "src",
			selector: "img"
		},
		"model.href": {
			type: "attribute",
			name: "href",
			selector: "a"
		}
	}
});

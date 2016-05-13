"use strict";

const AmpersandView = require("ampersand-view");

module.exports = AmpersandView.extend({
	template: (
		`<article class="bio"></article>`
	),
	props: {
		bio: {
			type: "string"
		}
	},
	bindings: {
		bio: {
			type: "innerHTML",
			selector: "article"
		}
	}
});

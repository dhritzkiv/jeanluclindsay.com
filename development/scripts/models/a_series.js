"use strict";

import ajaxConfig from "../misc/ajax_config";

const Model = require("ampersand-model");
const PiecesCollection = require("./pieces");

module.exports = Model.extend(ajaxConfig, {
	idAttribute: "slug",
	urlRoot: "/series",
	props: {
		slug: {
			type: "string"
		},
		title: {
			type: "string"
		}
	},
	derived: {
		href: {
			deps: ["slug"],
			fn() {
				const safeSlug = this.slug.replace(/\s/, "_");

				return `${this.urlRoot}/${safeSlug}`;
			}
		}
	},
	collections: {
		pieces: PiecesCollection
	}
});

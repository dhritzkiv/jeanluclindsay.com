"use strict";

const Model = require("ampersand-model");
import ajaxConfig from "../misc/ajax_config";
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
			fn: function() {
				return this.url();
			}
		}
	},
	collections: {
		pieces: PiecesCollection
	}
});
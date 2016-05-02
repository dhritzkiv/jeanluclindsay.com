"use strict";

const Model = require("ampersand-model");
const ajaxConfig = require("../misc/ajax_config");
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
	collections: {
		pieces: PiecesCollection
	}
});
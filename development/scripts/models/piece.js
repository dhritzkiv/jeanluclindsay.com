"use strict"

const AmpersandModel = require("ampersand-model");
const ajaxConfig = require("../misc/ajax_config");

module.exports = AmpersandModel.extend(ajaxConfig, {
	urlRoot: "/series",
	props: {
		title: {
			type: "string"
		},
		materials: {
			type: "string"
		},
		date: {
			type: "string"
		},
		image: {
			type: "array",
			default: () => []
		}
	}
});
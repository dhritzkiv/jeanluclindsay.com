"use strict";

const Collection = require("ampersand-rest-collection");
const ajaxConfig = require("../misc/ajax_config");
const PieceModel = require("./piece");

module.exports = Collection.extend(ajaxConfig, {
	url: function() {
		return `${this.parent.url()}${this.urlRoot}`;
	},
	urlRoot: "/pieces",
	model: PieceModel
});
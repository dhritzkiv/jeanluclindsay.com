"use strict";

const Collection = require("ampersand-rest-collection");
const ajaxConfig = require("../misc/ajax_config");
const SeriesModel = require("./a_series");

module.exports = Collection.extend(ajaxConfig, {
	urlRoot: "/series",
	mainIndex: "slug",
	model: SeriesModel
});
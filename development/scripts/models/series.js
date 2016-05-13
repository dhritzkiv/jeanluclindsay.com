"use strict";

import ajaxConfig from "../misc/ajax_config";

const Collection = require("ampersand-rest-collection");
const SeriesModel = require("./a_series");

module.exports = Collection.extend(ajaxConfig, {
	url() {
		return this.urlRoot;
	},
	urlRoot: "/series",
	mainIndex: "slug",
	model: SeriesModel
});

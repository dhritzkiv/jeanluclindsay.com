"use strict";

import ajaxConfig from "../misc/ajax_config";

import Collection from "ampersand-rest-collection";
import SeriesModel from "./a_series";

export default Collection.extend(ajaxConfig, {
	url() {
		return this.urlRoot;
	},
	urlRoot: "/series",
	mainIndex: "slug",
	model: SeriesModel
});

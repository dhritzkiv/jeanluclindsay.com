"use strict";

const Collection = require("ampersand-rest-collection");
import ajaxConfig from "../misc/ajax_config";
import makeLoadCheckCallback from "../misc/preload-helper";
const PieceModel = require("./piece");

module.exports = Collection.extend(ajaxConfig, {
	url() {
		return `${this.parent.url()}${this.urlRoot}`;
	},
	urlRoot: "/pieces",
	model: PieceModel,
	preloadThumbnails(callback) {
		const checkCallback = makeLoadCheckCallback(this.length, callback);
		
		this.forEach(piece => piece.preloadThumbnail(checkCallback));
	}
});
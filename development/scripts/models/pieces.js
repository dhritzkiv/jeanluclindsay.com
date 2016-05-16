import ajaxConfig from "../misc/ajax_config";
import makeLoadCheckCallback from "../misc/preload-helper";
import Collection from "ampersand-rest-collection";
import PieceModel from "./piece";

export default Collection.extend(ajaxConfig, {
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

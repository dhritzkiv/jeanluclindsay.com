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
		size: {
			type: "string"
		},
		images: {
			type: "array",
			default: () => []
		}
	},
	derived: {
		images_uris: {
			deps: ["images", "parent.slug"],
			fn: function() {
				const parent = this.collection.parent;
				const seriesUrl = parent.url();
				
				return this.images.map(image => `${seriesUrl}/${image}`);
			}
		},
		first_image_uri: {
			deps: ["images_uris"],
			fn: function() {
				return this.images_uris[0];
			}
		}
	}
});


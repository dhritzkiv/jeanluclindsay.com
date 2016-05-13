"use strict"

import ajaxConfig from "../misc/ajax_config";

const AmpersandModel = require("ampersand-model");

module.exports = AmpersandModel.extend(ajaxConfig, {
	urlRoot: "/series",
	props: {
		id: {
			type: "string"
		},
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
			fn() {
				const parent = this.collection.parent;
				const seriesUrl = parent.url();
				
				return this.images.map(image => `${seriesUrl}/${image}`);
			}
		},
		first_image_uri: {
			deps: ["images_uris"],
			fn() {
				return this.images_uris[0];
			}
		},
		first_image_thumbnail_uri: {
			deps: ["first_image_uri"],
			fn() {
				return this.first_image_uri.replace(/^(.+)(\.[a-z]{3,4})$/g, "$1_t$2");
			}
		},
		href: {
			deps: ["id"],
			fn() {
				return `${this.collection.parent.href}/${this.id}`;
			}
		},
		year: {
			deps: ["date"],
			fn() {
				return this.date.toString().slice(0, 4);
			}
		}
	},
	preloadThumbnail(callback) {
		const image = new Image();
		
		image.addEventListener("load", callback);
		image.addEventListener("error", callback);
		
		image.src = this.first_image_thumbnail_uri;
		
		return image;
	}
});


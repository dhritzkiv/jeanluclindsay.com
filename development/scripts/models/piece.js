"use strict"

import ajaxConfig from "../misc/ajax_config";
import makeLoadCheckCallback from "../misc/preload-helper";

const AmpersandModel = require("ampersand-model");

const preloadImage = (src, callback) => {
	const image = new Image();
		
	const imageCallback = () => {
		image.removeEventListener("load", imageCallback);
		image.removeEventListener("error", imageCallback);
		callback();
	};
	
	image.addEventListener("load", imageCallback);
	image.addEventListener("error", imageCallback);
	
	image.src = src;
	
	return image;
};

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
		url_safe_title: {
			deps: ["title"],
			fn() {
				return this.title.slice(0, 96).toLowerCase().replace(/[,\.:]/g, " ").replace(/\s/g, "_")
			}
		},
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
				return `${this.collection.parent.href}/${this.url_safe_title}-${this.id}`;
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
		preloadImage(this.first_image_thumbnail_uri, callback);
	},
	preloadImages(callback) {
		const checkCallback = makeLoadCheckCallback(this.images.length, callback);
		
		this.images_uris.forEach(images_uri => preloadImage(images_uri, checkCallback));
	}
});


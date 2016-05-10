"use strict"

import moment from "moment";
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
		},
		href: {
			deps: ["id"],
			fn: function() {
				return `${this.collection.parent.url()}/${this.id}`;
			}
		},
		year: {
			deps: ["date"],
			fn: function() {
				return moment(new Date(this.date)).format("YYYY");
			}
		}
	}
});


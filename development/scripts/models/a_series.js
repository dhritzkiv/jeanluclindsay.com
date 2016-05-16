"use strict";

import ajaxConfig from "../misc/ajax_config";

import Model from "ampersand-model";
import PiecesCollection from "./pieces";

export default Model.extend(ajaxConfig, {
	idAttribute: "slug",
	urlRoot: "/series",
	props: {
		slug: {
			type: "string"
		},
		title: {
			type: "string"
		}
	},
	derived: {
		href: {
			deps: ["slug"],
			fn() {
				const safeSlug = this.slug.replace(/\s/, "_");

				return `${this.urlRoot}/${safeSlug}`;
			}
		}
	},
	collections: {
		pieces: PiecesCollection
	}
});

"use strict";

const AmpersandView = require("ampersand-view");

module.exports = AmpersandView.extend({
	template: (
		`<article class="a_series">
			<header>
				<a href="/" title="close">×</a>
				<h2 data-hook="title"></h2>
			</header>
			<section data-hook="piece-holder">
				<article class="piece expanded">
					<figure>
						<div data-hook="images"></div>
						<figcaption>
							<h3 data-hook="materials"></h3>
							<h3 data-hook="year"></h3>
						</figcaption>
					</figure>
				</article>
			</section>			
		</article>`
	),
	bindings: {
		"model.collection.parent.href": {
			type: "attribute",
			name: "href",
			selector: "a"
		},
		"model.title": {
			type: "text",
			hook: "title"
		},
		"model.materials": {
			type: "text",
			hook: "materials"
		},
		"model.year": {
			type: "text",
			hook: "year"
		},
		"model.images_uris": {
			type: (el, val) => {
				const imagesString = val.reduce((string, uri) => string += `<img src="${uri}"/>\n`, "");
				
				el.innerHTML = imagesString;
			},
			hook: "images"
		}
	}
});
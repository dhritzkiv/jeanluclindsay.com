import AmpersandView from "ampersand-view";

export default AmpersandView.extend({
	template: (
		`<section>
			<header>
				<a href="/" title="close">×</a>
				<h2></h2>
			</header>
			<article></article>
		</section>`
	),
	props: {
		class: {
			type: "string"
		},
		body: {
			type: "string"
		},
		title: {
			type: "string"
		}
	},
	bindings: {
		body: {
			type: "innerHTML",
			selector: "article"
		},
		title: {
			type: "text",
			selector: "header h2"
		},
		class: {
			type: "class",
			selector: "section"
		}
	}
});

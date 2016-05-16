import AmpersandView from "ampersand-view";

export default AmpersandView.extend({
	template: (
		`<article class="bio"></article>`
	),
	props: {
		bio: {
			type: "string"
		}
	},
	bindings: {
		bio: {
			type: "innerHTML",
			selector: "article"
		}
	}
});

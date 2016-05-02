"use strict";

const View = require("ampersand-view");
const ViewSwitcher = require('ampersand-view-switcher');

module.exports = View.extend({
	template: (
		`<body>
			<nav id="main-nav">
				<h1>Jean-Luc Lindsay</h1>
				<ul>
					<li>
						<a href="/about">About</a>
					</li>
					<li>
						<a href="/series/hodgepodge">Hodgepodge</a>
					</li>
					<li>
						<a href="/series/expo_67">Expo 67'</a>
					</li>
					<li>
						<a href="/contact">Contact</a>
					</li>
				</ul>
			</nav>
		</body>`
	),
	events: {
		"click a[href]": "linkClick"
	},
	render: function() {
		this.renderWithTemplate();
		
		this.pageContainer = this.query('main');

		this.modeSwitcher = new ViewSwitcher(this.pageContainer, {
			show: () => {
				//document.title = result(newView, "pageTitle");
				window.scrollTo(0, 0);
			}
		});
		
		return this;
	},
	linkClick: function(event) {
		const target = event.delegateTarget;
		
		if (target.host !== window.location.host) {
			return true;
		}
		
		app.router.navigate(target.pathname + target.search);
		event.preventDefault();
	}
});
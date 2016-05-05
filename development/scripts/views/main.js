"use strict";

const View = require("ampersand-view");
const ViewSwitcher = require('ampersand-view-switcher');

const SeriesItem = View.extend({
	template: (
		`<li>
			<a></a>
		</li>`
	),
	derived: {
		href: {
			deps: ["model.url"],
			fn: function() {
				return this.model.url();
			}
		}
	},
	bindings: {
		"href": {
			type: "attribute",
			name: "href",
			selector: "a"
		},
		"model.title": {
			type: "text",
			selector: "a"
		}
	}
});

module.exports = View.extend({
	template: (
		`<body>
			<nav id="site-logo">
				<a href="/">
					<h1>Jean-Luc Lindsay</h1>
				</a>
			</nav>
			<main></main>
			<nav id="site-nav">
				<ul>
					<li>
						<a href="/about">About</a>
					</li>
					<ul data-hook="series-list"></ul>
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

		this.pageSwitcher = new ViewSwitcher(this.query('main'), {
			show: (newView) => {
				//document.title = result(newView, "pageTitle");
				window.scrollTo(0, 0);
			}
		});
		
		this.renderCollection(app.series, SeriesItem, this.queryByHook("series-list"));
		
		return this;
	},
	setPage: function(page) {
		
		if (page) {
			this.pageSwitcher.set(page)
		} else {
			this.pageSwitcher.clear();
		}
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
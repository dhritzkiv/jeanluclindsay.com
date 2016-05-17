/*globals app*/

import View from "ampersand-view";
import ViewSwitcher from "ampersand-view-switcher";
import scroller from "scroll";

const CLASS_CLOSING = "closing";
const CLASS_OPENING = "opening";
const TRANSITION_TIMEOUT = 700;
const DEFAULT_TITLE = "Jean-Luc Lindsay";

const SeriesItem = View.extend({
	template: (
		`<li>
			<a></a>
		</li>`
	),
	bindings: {
		"model.href": {
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

export default View.extend({
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
	render() {
		this.renderWithTemplate();

		const mainEl = this.query("main");

		this.pageSwitcher = new ViewSwitcher(mainEl, {
			waitForRemove: true,
			hide: (oldView, callback) => {
				const height = mainEl.clientHeight;

				scroller.top(document.scrollingElement, 0, {
					duration: TRANSITION_TIMEOUT / 2,
					ease: "inOutSine"
				}, () => {
					mainEl.style.height = `${height}px`;

					requestAnimationFrame(() => {
						mainEl.getBoundingClientRect();
						mainEl.classList.add(CLASS_CLOSING);
						mainEl.style.height = "0px";
					});

					setTimeout(() => {
						mainEl.style.height = "";
						mainEl.classList.remove(CLASS_CLOSING);

						callback();
					}, TRANSITION_TIMEOUT);
				});
			},
			show: (newView) => {

				document.title = newView.pageTitle || DEFAULT_TITLE;

				const height = mainEl.clientHeight;

				mainEl.style.height = "0px";
				mainEl.classList.remove(CLASS_CLOSING);
				mainEl.classList.add(CLASS_OPENING);

				requestAnimationFrame(() => {
					mainEl.getBoundingClientRect();//needed to cause a layout reflow and trigger the css animation;
					mainEl.style.height = `${height}px`;
				});

				setTimeout(() => {
					mainEl.classList.remove(CLASS_OPENING);
					mainEl.style.height = "";
				}, TRANSITION_TIMEOUT);
			}
		});

		this.renderCollection(app.series, SeriesItem, this.queryByHook("series-list"));

		return this;
	},
	setPage(page) {

		if (page) {
			this.pageSwitcher.set(page);
		} else {
			this.pageSwitcher.clear();
		}
	},
	linkClick(event) {
		const target = event.delegateTarget;

		if (target.host !== window.location.host) {
			return true;
		}

		app.router.navigate(target.pathname + target.search);
		event.preventDefault();
	}
});

"use strict";

import "babel-polyfill";

import app from "ampersand-app";
import Raven from "raven-js";
import Router from "./router";
import WebFont from "webfontloader";
import MainView from "./views/main";
import SeriesCollection from "./models/series";
import "scrollingelement";

Raven.config("__SENTRY_DSN__", {
	release: "__VERSION__",
	maxMessageLength: 512
}).install();

app.extend({
	initialize() {

		/*ga('create', "UA-47020641-4", {
			'siteSpeedSampleRate': 50
		});*/

		this.series = new SeriesCollection();
		this.series.fetch();

		this.render();
	},
	render() {

		const view = this.view = new MainView({
			el: document.body
		});

		view.render();

		const router = this.router = new Router();

		router.on("newPage", view.setPage, view);

		router.on("navigation", () => {
			//const path = window.location.pathname + window.location.search + window.location.hash;

			/*ga('set', 'page', path);

			ga('send', 'pageview', {
				page: path,
				title: document.title
			});*/
		});

		router.history.start({
			pushState: true,
			root: "/"
		});
	}
});

/* Google Analytics */
/*(() => {
	window.GoogleAnalyticsObject = 'ga';
	var sciptTagName = 'script';

	window.ga = () => {
		(ga.q = ga.q || []).push(arguments);
	};

	ga.l = (new Date()).getTime();

	var script = document.createElement(sciptTagName);
	script.async = true;
	script.src = 'https://www.google-analytics.com/analytics.js';

	var prevScript = document.getElementsByTagName(sciptTagName)[0];
	prevScript.parentNode.insertBefore(script, prevScript);
})();*/

WebFont.load({
	typekit: {
		id: "trf8ahx"
	},
	timeout: 3000,
	active: () => {
		app.trigger("fonts-loaded");
	}
});

export default window.app = app;

app.initialize();

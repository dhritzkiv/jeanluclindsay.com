"use strict";

const app = require('ampersand-app');
//const Raven = require("raven-js");
const Router = require("./router");
const WebFont = require("webfontloader");
const MainView = require("./views/main");

/*Raven.config("https://b2558f5fcd4342118dfb18e1dc0883e5@app.getsentry.com/64892", {
	release: "__VERSION__",
	maxMessageLength: 512
}).install();*/

app.extend({
	initialize: function () {
		
		/*ga('create', "UA-47020641-4", {
			'siteSpeedSampleRate': 50
		});*/
		
		this.render();
	},
	render: function() {
		
		const view = this.view = new MainView({
			el: document.body
		});
		
		view.render();
		
		const router = this.router = new Router();
		
		router.on('newPage', view.setPage, view);
		
		router.on('navigation', function() {
			const path = window.location.pathname + window.location.search + window.location.hash;
			
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
/*(function() {
	window.GoogleAnalyticsObject = 'ga';
	var sciptTagName = 'script';

	window.ga = function() {
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
		id: 'trf8ahx'
	},
	timeout: 3000,
	active: () => {
		app.trigger("fonts-loaded");
	}
});

module.exports = window.app = app;

app.initialize();

"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const StartPage = require("./views/start");

const SeriesCollection = require("./models/series");
const SeriesModel = require("./models/a_series");

const DEFAULT_TITLE = "Jean-Luc Lindsay";

module.exports = AmpersandRouter.extend({
	routes: {
		"": "start",
		"series/:series": "series",
		"(*path)": "catchAll"
	},
	start() {
		this.trigger("newPage", new StartPage());
		
		document.title = DEFAULT_TITLE;
		
		this.trigger("navigation");		
	},
	series(seriesSlug) {		
		const series = app.series = (app.series || new SeriesCollection());
		
		series.getOrFetch(seriesSlug, (err, seriesModel) => {
			
			if (err) {
				return console.error(err);
			}
			
			//seriesModel;
		});
	},
	catchAll() {
		this.redirectTo("/");
	}
});

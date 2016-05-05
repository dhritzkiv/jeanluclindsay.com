"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const ASeriesPage = require("./views/a_series");

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
		this.trigger("newPage", null);
		
		document.title = DEFAULT_TITLE;
		
		this.trigger("navigation");		
	},
	series(seriesSlug) {		
		const series = app.series;
		
		series.getOrFetch(seriesSlug, (err, seriesModel) => {
			
			if (err) {
				return console.error(err);
			}
			
			seriesModel.pieces.fetch();
			
			this.trigger("newPage", new ASeriesPage({
				model: seriesModel
			}));
		});
	},
	catchAll() {
		const pathname = window.location.pathname;
		
		if (pathname[pathname.length - 1] === "/") {
			return this.redirectTo(pathname.slice(0, -1));
		}
		
		this.redirectTo("/");
	}
});

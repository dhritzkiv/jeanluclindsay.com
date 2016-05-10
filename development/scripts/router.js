"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const ASeriesPage = require("./views/a_series");
const ASeriesPiecePage = require("./views/piece");

const SeriesCollection = require("./models/series");
const SeriesModel = require("./models/a_series");

const DEFAULT_TITLE = "Jean-Luc Lindsay";

module.exports = AmpersandRouter.extend({
	routes: {
		"": "start",
		"series/:series": "aSeries",
		"series/:series/:pieceId": "aSeriesPiece",
		"(*path)": "catchAll"
	},
	start() {
		this.trigger("newPage", null);
		
		document.title = DEFAULT_TITLE;
		
		this.trigger("navigation");		
	},
	_getASeries(slug, callback) {		
		app.series.getOrFetch(slug, callback);
	},
	aSeries(seriesSlug) {
		this._getASeries(seriesSlug, (err, seriesModel) => {
			
			if (err) {
				return console.error(err);
			}
			
			const view = new ASeriesPage({
				model: seriesModel
			});
			
			seriesModel.pieces.fetch({
				always: () => {
					this.trigger("newPage", view);
				}
			});
		});
	},
	aSeriesPiece(seriesSlug, id) {
		
		const router = this;
		
		//pieceTitle is likely to be "Untitled",
		//which isn't good as an ID.
		//solution: MD5:
		// - the image;
		// - the entire static JSON; or,
		// - add more specific identifiers
		
		this._getASeries(seriesSlug, (err, seriesModel) => {
			
			if (err) {
				return console.error(err);
			}
			
			const pieces = seriesModel.pieces;
			
			pieces.fetch({
				always: (err) => {
					
					if (err) {
						return console.error(err);
					}
					
					const piece = pieces.get(id);
					
					if (!piece) {
						console.error(new Error("Piece not found"));
					}
					
					const view = new ASeriesPiecePage({
						model: piece,
						collection: pieces
					});
					
					router.trigger("newPage", view);
				}
			});			
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

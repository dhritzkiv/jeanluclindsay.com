"use strict";

const app = require("ampersand-app");
const xhr = require("xhr");
const AmpersandRouter = require("ampersand-router");

const ASeriesPage = require("./views/a_series");
const ASeriesPiecePage = require("./views/piece");
const AboutPage = require("./views/about");

const SeriesCollection = require("./models/series");
const SeriesModel = require("./models/a_series");

const DEFAULT_TITLE = "Jean-Luc Lindsay";

module.exports = AmpersandRouter.extend({
	routes: {
		"": "start",
		"about": "about",
		"series/:series": "aSeries",
		"series/:series/:pieceId": "aSeriesPiece",
		"(*path)": "catchAll"
	},
	start() {
		this.trigger("newPage", null);

		document.title = DEFAULT_TITLE;

		this.trigger("navigation");
	},
	about() {
		const router = this;

		xhr({
			url: "/about",
			json: true
		}, (err, res, body) => {

			if (err) {

			}

			const view = new AboutPage(body);

			router.trigger("newPage", view);
		});
	},
	_getASeries: (slug, callback) => {
		slug = slug.replace("_", " ");
		app.series.getOrFetch(slug, callback);
	},
	aSeries(seriesSlug) {
		const router = this;

		this._getASeries(seriesSlug, (err, seriesModel) => {

			if (err) {
				return console.error(err);
			}

			const view = new ASeriesPage({
				model: seriesModel
			});

			seriesModel.pieces.fetch({
				always: () => {
					seriesModel.pieces.preloadThumbnails(() => router.trigger("newPage", view));
				}
			});
		});
	},
	aSeriesPiece(seriesSlug, id) {
		const router = this;

		id = id.slice(-22);

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

					piece.preloadImages(() => router.trigger("newPage", view));
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

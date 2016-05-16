"use strict";

import app from "ampersand-app";
import xhr from "xhr";
import AmpersandRouter from "ampersand-router";
import ASeriesPage from "./views/a_series";
import ASeriesPiecePage from "./views/piece";
import AboutPage from "./views/about";
import Raven from "raven-js";

export default AmpersandRouter.extend({
	routes: {
		"": "start",
		"about": "about",
		"series/:series": "aSeries",
		"series/:series/:pieceId": "aSeriesPiece",
		"(*path)": "catchAll"
	},
	start() {
		this.trigger("newPage", null);
		this.trigger("navigation");
	},
	about() {
		const router = this;

		xhr({
			url: "/about",
			json: true
		}, (err, res, body) => {

			if (err) {
				return Raven.captureException(err);
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
				return Raven.captureException(err);
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
				return Raven.captureException(err);
			}

			const pieces = seriesModel.pieces;

			pieces.fetch({
				always: (err) => {

					if (err) {
						return Raven.captureException(err);
					}

					const piece = pieces.get(id);

					if (!piece) {
						return Raven.captureException(new Error("Piece not found"));
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

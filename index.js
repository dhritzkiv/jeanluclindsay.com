"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");

const seriesRouter = require(path.join(process.cwd(), "routes", "series"));
const packageInfo = require(path.join(process.cwd(), "package.json"));
const publicFileDirectory = path.join(process.cwd(), 'public');
const indexFileContents = fs.readFileSync(path.join(publicFileDirectory, "index.html"), "utf8");

/*const config = (env => {
	let configPath = path.join(process.cwd(), "config.json");
	
	if (env === "production") {
		configPath = path.join(process.cwd(), "config-production.json");
	}
	
	return require(configPath);
})(process.env.NODE_ENV);*/

const config = require(path.join(process.cwd(), "config.json"));

const app = express();

app.set("title", packageInfo.name);
app.set("version", packageInfo.version);
app.set("port", process.env.PORT || config.port);
/* Nicer formatted json output */
app.set('json spaces', '\t');
/* Disable X-Powered-by header */
app.disable('x-powered-by');

app.use(express.static(publicFileDirectory, {
	maxAge: 1000 * 60 * 60 * 24 * 7
}));

app.use((req, res, next) => {
	req.resData = {};
	next();
});

app
.route("*")
.get((req, res, next) => {
	
	if (req.accepts("html", "json") === "json") {
		return next();
	}
	
	res.setHeader("content-type", "text/html; charset=utf-8");
	res.send(indexFileContents);
});

app.get("/series", seriesRouter.getSeriesModels);
app.get("/series/:slug", seriesRouter.findASeries, seriesRouter.getASeries);
app.get("/series/:slug/pieces", seriesRouter.findASeries, seriesRouter.findASeriesPieces, seriesRouter.getASeriesPieces);


app.listen(app.get("port"), () => console.log(`${new Date().toISOString()}: Server for ${app.get('title')} v.${app.get('version')} ${app.settings.env}, listening on port ${app.get('port')}`));
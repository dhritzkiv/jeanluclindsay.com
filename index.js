"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");

const seriesRouter = require(path.join(process.cwd(), "routes", "series"));

const publicFilesDirectory = path.join(process.cwd(), 'public');
const seriesFilesDirectory = path.join(process.cwd(), "content", "series");

const packageInfo = require(path.join(process.cwd(), "package.json"));
const config = require(path.join(process.cwd(), "config.json"));
const indexFileContents = fs.readFileSync(path.join(publicFilesDirectory, "index.html"), "utf8");

/*const config = (env => {
	let configPath = path.join(process.cwd(), "config.json");
	
	if (env === "production") {
		configPath = path.join(process.cwd(), "config-production.json");
	}
	
	return require(configPath);
})(process.env.NODE_ENV);*/

const app = express();

app.set("title", packageInfo.name);
app.set("version", packageInfo.version);
app.set("port", process.env.PORT || config.port);
/* Nicer formatted json output */
app.set('json spaces', '\t');
/* Disable X-Powered-by header */
app.disable('x-powered-by');

app.use(express.static(publicFilesDirectory, {
	maxAge: 1000 * 60 * 60 * 24 * 7
}));

app.use((req, res, next) => {
	req.resData = {};
	next();
});

app.get("*", (req, res, next) => {
	
	if (/\.[a-z0-9]{2,4}/i.test(req.url) || req.accepts("html", "json") === "json") {
		return next();
	}
	
	res.setHeader("content-type", "text/html; charset=utf-8");
	res.send(indexFileContents);
});

app.get("/series", seriesRouter.getSeriesModels);
app.get("/series/:slug", seriesRouter.findASeries, seriesRouter.getASeries);
app.get("/series/:slug/pieces", seriesRouter.findASeries, seriesRouter.findASeriesPieces, seriesRouter.getASeriesPieces);

app.use("/series", express.static(seriesFilesDirectory, {
	maxAge: 1000 * 60 * 60 * 24
}));

app.listen(app.get("port"), () => console.log(`${new Date().toISOString()}: Server for ${app.get('title')} v.${app.get('version')} ${app.settings.env}, listening on port ${app.get('port')}`));
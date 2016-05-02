"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const express = require("express");
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

const contentDir = path.join(process.cwd(), "content");
const seriesDir = path.join(contentDir, "series");

const findSeries = (req, res, next) => {
	const slug = req.params.slug;
	const thisSeriesDir =  path.join(seriesDir, slug);
	
	const seriesData = {};
	
	fs.readdir(path.join(seriesDir, slug), (err, files) => {
		
		if (err) {
			return next(err);
		}
		
		const piecesManifestName = "pieces.csv";
		
		if (!files.includes(piecesManifestName)) {
			return next(new Error("Pieces not found"));
		}
		
		const piecesManifestPath = path.join(thisSeriesDir, piecesManifestName);
		
		fs.readFile(piecesManifestPath, {
			encoding: "utf8"
		}, (err, file) => {
			
			if (err) {
				return next(err);
			}
			
			const rows = file.split(os.EOL);
			
			const headerRowColumns = rows
			.shift()
			.split(",")
			.map(column => column.trim())
			
			seriesData.pieces = rows
			.map(row => row.split(","))
			.map(row => {
				const data = {};
				
				row
				.map(column => column.trim().replace(/^["']/, "").replace(/["']$/, ""))
				.map((column, index) => [headerRowColumns[index], column])
				.forEach(column => data[column[0]] = column[1]);
				
				data.image = data.image.split(",").map(image => image.trim());
				
				return data;
			});
			
			req.resData.series = seriesData;
			next();
		});
	});
	
	/*fs.readdir(path.join(seriesDir, slug), (err, files) => {
		
	});*/
}

app
.route("/series/:slug")
.get(findSeries, (req, res) => {
	const seriesData = req.resData.series;
	res.json(seriesData);
});

app.listen(app.get("port"), () => {
	console.log(new Date());
	console.log((
		`Server for ${app.get('title')} v.${app.get('version')} ${app.settings.env} running and listening at port ${app.get('port')}`
	));
});
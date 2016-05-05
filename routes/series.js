"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const h = require("highland");

const cpuCount = os.cpus().length;

const contentDir = path.join(process.cwd(), "content");
const seriesDir = path.join(contentDir, "series");
const piecesManifestName = "pieces.csv";
	
const toSeriesModel = name => ({
	slug: encodeURIComponent(name.replace(" ", "_").toLowerCase()),
	title: name
});

//returns a JSON array with series models
exports.getSeriesModels = (req, res, next) => {
	const readdirStream = h.wrapCallback(fs.readdir);
	const statStream = h.wrapCallback(fs.stat);
	
	const series = [];
	
	readdirStream(seriesDir).flatten()
	//.stopOnError(err => next(err))
	.map(filename => 
		statStream(path.join(seriesDir, filename))
		.map(stat => ({
			filename,
			isDirectory: stat.isDirectory()
		}))
	)
	.parallel(cpuCount)
	.filter(fileObject => fileObject.isDirectory)
	.map(fileObject => fileObject.filename)
	.map(toSeriesModel)
	.toArray(series => res.json(series))
};

exports.findASeries = (req, res, next) => {
	const slug = (req.params.slug || "").replace("_", " ");
	
	if (!slug) {
		return next(new Error("Missing series"));
	}
	
	fs.access(path.join(seriesDir, slug), (err) => {
		
		if (err) {
			return next(err);
		}
		
		req.resData.series = toSeriesModel(slug);
		next();
	});
};

exports.findASeriesPieces = (req, res, next) => {
	const seriesData = req.resData.series;
	const thisSeriesDir = path.join(seriesDir, seriesData.slug);
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
		
		const pieces = rows
		.map(row => row.split(","))
		.map(row => {
			const data = {};
			
			row
			.map(column => column.trim().replace(/^["']/, "").replace(/["']$/, ""))
			.map((column, index) => [headerRowColumns[index], column])
			.forEach(column => data[column[0]] = column[1]);
			
			data.title = data.title || "Untitled";
			
			data.images = (data.images || "")
			.split(",")
			.map(image => image.trim());
			
			return data;
		});
		
		req.resData.pieces = pieces;
		next();
	});
};

exports.getASeries = (req, res) => res.json(req.resData.series);

exports.getASeriesPieces = (req, res) => res.json(req.resData.pieces);
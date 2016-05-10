"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require('crypto');
const h = require("highland");
const csvParse = require("csv-parse");

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
	
	const readStream = fs.createReadStream(piecesManifestPath);
	
	const csvParser = csvParse({
		delimiter: ",",
		columns: true,
		skip_empty_lines: true,
		trim: true
	});
	
	h(csvParser)
	.map(pieceData => {
		pieceData.title = pieceData.title || "Untitled";
			
		pieceData.images = (pieceData.images || "")
		.split(",")
		.map(image => image.trim());
		
		return pieceData;
	})
	.filter(pieceData => pieceData.images.length)
	.map(pieceData => {
		const image = pieceData.images[0];
		const imageReadStream = fs.createReadStream(path.join(thisSeriesDir, image));
		const hash = crypto.createHash('md5');
		
		return h(imageReadStream.pipe(hash))
		.map(buffer => {
			const id = buffer
			.toString("base64")
			.slice(0, 22)//strip extra 2 characters
			.toLowerCase()//this reduces uniquness, but it's still enough
			.replace(/\//g, "_")
			.replace(/\+/g, "-");
			
			pieceData.id = id;
			return pieceData;
		});
	})
	.parallel(cpuCount)
	.sortBy((a, b) => new Date(a.date.toString()) - new Date(b.date.toString()))
	.toArray(pieces => {
		req.resData.pieces = pieces;
		next();
	});
	
	readStream.pipe(csvParser);
};

exports.getASeries = (req, res) => res.json(req.resData.series);

exports.getASeriesPieces = (req, res) => res.json(req.resData.pieces);


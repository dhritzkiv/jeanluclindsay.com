"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const h = require("highland");
const csvParse = require("csv-parse");
const gm = require("gm");
const raven = require("raven");

const cpuCount = os.cpus().length;
const tmpDir = os.tmpDir();

const config = require(path.join(process.cwd(), "config"));

const contentDir = path.join(process.cwd(), "content");
const seriesDir = path.join(contentDir, "series");
const piecesManifestName = "pieces.csv";

const toSeriesModel = name => ({
	slug: name,
	title: name
});

const ravenClient = new raven.Client(config.sentry_dsn_server);
const errorToRaven = (err) => ravenClient.captureException(err);

//returns a JSON array with series models
exports.getSeriesModels = (req, res) => {
	const readdirStream = h.wrapCallback(fs.readdir);
	const statStream = h.wrapCallback(fs.stat);

	readdirStream(seriesDir).flatten()
	.errors(errorToRaven)
	.map(filename =>
		statStream(path.join(seriesDir, filename))
		.errors(errorToRaven)
		.map(stat => ({
			filename,
			created_date: stat.birthtime,
			isDirectory: stat.isDirectory()
		}))
	)
	.parallel(cpuCount)
	.filter(fileObject => fileObject.isDirectory)
	.sortBy((a, b) => b.created_date - a.created_date)
	.map(fileObject => fileObject.filename)
	.map(toSeriesModel)
	.toArray(series => res.json(series));
};

exports.findASeries = (req, res, next) => {
	const slug = req.params.slug;

	if (!slug) {
		return next(new Error("Missing series"));
	}

	req.resData.series = toSeriesModel(slug);

	fs.access(path.join(seriesDir, slug), next);
};

exports.findASeriesPieces = (req, res, next) => {
	const slug = req.params.slug;
	const thisSeriesDir = path.join(seriesDir, slug);
	const piecesManifestPath = path.join(thisSeriesDir, piecesManifestName);

	const readStream = fs.createReadStream(piecesManifestPath);

	const csvParser = csvParse({
		delimiter: ",",
		columns: true,
		skip_empty_lines: true,
		trim: true
	});

	h(readStream)
	.errors(() => {})
	.through(csvParser)
	.errors(errorToRaven)
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

		return h(fs.createReadStream(path.join(thisSeriesDir, image)))
		.errors(() => {})
		.through(crypto.createHash("md5"))
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
};

exports.getASeries = (req, res) => res.json(req.resData.series);

exports.getASeriesPieces = (req, res) => res.json(req.resData.pieces);

exports.findOrMakeThumbnail = (req, res, next) => {
	const fileName = req.params.filename;
	const thisSeriesDir = path.join(seriesDir, req.params.slug);
	const filePath = path.join(thisSeriesDir, fileName);
	const fileNameParsed = path.parse(filePath);

	if (!/_t$/.test(fileNameParsed.name)) {
		return next("route");
	}

	const originalPath = filePath.replace("_t", "");
	const tmpPath = path.join(tmpDir, fileName);

	req.resData.thumbnailPath = tmpPath;

	fs.access(tmpPath, (err) => {

		if (!err) {
			return next();
		}

		gm(originalPath)
		.quality(92)
		.resize(392, null)
		.write(tmpPath, next);
	});
};

exports.getThumbnail = (req, res) => {
	res.sendFile(req.resData.thumbnailPath);
};

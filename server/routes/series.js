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
const tmpDir = os.tmpdir();

const cache = require(path.join(process.cwd(), "misc", "weak-cache.js"));
const SERIES_CACHE_KEY = "series";

const projectRoot = path.join(process.cwd(), "..");
const contentDir = path.join(projectRoot, "content");
const seriesDir = path.join(contentDir, "series");
const piecesManifestName = "pieces.csv";

const ID_LENGTH = 22;

const config = require(path.join(projectRoot, "config"));

const sendFileOptions = {
	//maxAge in ms
	maxAge: 1000 * 60 * 60 * 24 * 3
};

const toSeriesModel = name => ({
	slug: name,
	title: name
});

const csvParserOptions = {
	delimiter: ",",
	columns: true,
	skip_empty_lines: true,
	trim: true
};

const ravenClient = new raven.Client(config.sentry_dsn_server);
const errorToRaven = (err) => ravenClient.captureException(err);

//returns a JSON array with series models
exports.findSeriesModels = (req, res, next) => {

	const cachedSeries = cache.get(SERIES_CACHE_KEY);

	if (cachedSeries) {
		req.resData.series = cachedSeries;

		return next();
	}

	const readdirStream = h.wrapCallback(fs.readdir);
	const statStream = h.wrapCallback(fs.stat);
	const readStream = h.wrapCallback(fs.readFile);

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
	.map(directoryData => {

		const csvParser = csvParse(csvParserOptions);

		return readStream(path.join(seriesDir, directoryData.filename, piecesManifestName))
		.errors(errorToRaven)
		.through(csvParser)
		.map(pieceData => new Date(pieceData.date.toString()))
		.sortBy((a, b) => b - a)
		.head()
		.map(seriesLatestDate => Object.assign(directoryData, {
			latest_date: seriesLatestDate
		}));
	})
	.parallel(cpuCount)
	.sortBy((a, b) => b.created_date - a.created_date)
	.sortBy((a, b) => b.latest_date - a.latest_date)
	.map(fileObject => fileObject.filename)
	.map(toSeriesModel)
	.toArray(series => {
		cache.set(SERIES_CACHE_KEY, series);
		req.resData.series = series;
		next();
	});
};

exports.getSeriesModels = (req, res) => {
	res.json(req.resData.series);
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

	const THIS_SERIES_CACHE_KEY = `SERIES_CACHE_KEY/${slug}`;
	const cachedASeries = cache.get(THIS_SERIES_CACHE_KEY);

	if (cachedASeries) {
		req.resData.pieces = cachedASeries;

		return next();
	}

	const thisSeriesDir = path.join(seriesDir, slug);
	const piecesManifestPath = path.join(thisSeriesDir, piecesManifestName);

	const readStream = fs.createReadStream(piecesManifestPath);
	const csvParser = csvParse(csvParserOptions);

	h(readStream)
	.errors(() => {})
	.through(csvParser)
	.errors(errorToRaven)
	.map(pieceData => {
		pieceData.title = (pieceData.title || "Untitled").toLowerCase();

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
			.slice(0, ID_LENGTH)//strip extra 2 characters
			.toLowerCase()//this reduces uniquness, but it's still enough
			.replace(/\//g, "_")
			.replace(/\+/g, "-");

			pieceData.id = id;

			return pieceData;
		});
	})
	.parallel(cpuCount)
	.sortBy((a, b) => new Date(b.date.toString()) - new Date(a.date.toString()))
	.toArray(pieces => {
		req.resData.pieces = pieces;
		cache.set(THIS_SERIES_CACHE_KEY, pieces);
		next();
	});
};

exports.getASeries = (req, res) => res.json(req.resData.series);

exports.getASeriesPieces = (req, res) => res.json(req.resData.pieces);

exports.getASeriesPiece = (req, res, next) => {
	const pieces = req.resData.pieces;
	const id = req.params.piece_name.slice(-ID_LENGTH);
	const piece = pieces.find(piece => piece.id === id);

	if (!piece) {
		return next(new Error(`Piece ${req.params.piece_name} not found`));
	}

	if (req.isSocialCrawler) {
		const url = `${config.hostname}${req.url}`;
		const imagePaths = piece.images.map(image => image.replace(/(\.[a-z0-9]{2,4}$)/, "_t$1"));
		const pageTitle = `${piece.title} - ${config.title}`;

		let html = (
			`<!DOCTYPE HTML>
			<html>
				<head>`
		);

		html += (
					`<meta property="og:type" content="website"/>
					<meta property="og:title" content="${pageTitle}"/>
					<meta property="og:url" content="${url}"/>`
		);

		h(imagePaths)
		.map(imagePath => {
			const imageLocalPath = path.join(tmpDir, imagePath);

			return h((push) => {
				gm(imageLocalPath).size((err, size) => {

					const data = {
						uri: `${config.hostname}/series/${req.resData.series.slug}/images/${imagePath}`,
						width: size.width,
						height: size.height
					};

					push(err, data);
					push(null, h.nil);
				});
			});
		})
		.parallel(cpuCount)
		.toArray(images => {

			images.forEach(imageData => {
				html += (
					`<meta property="og:image" content="${imageData.uri}"/>
					<meta property="og:image:width" content="${imageData.width}"/>
					<meta property="og:image:height" content="${imageData.height}"/>

					<meta name="twitter:image" content="${imageData.uri}"/>
					<meta name="twitter:image:width" content="${imageData.width}"/>
					<meta name="twitter:image:height" content="${imageData.height}"/>`
				);
			});

			html += (
					`<meta property="og:description" content="${config.description}"/>
					<meta name="twitter:card" content="summary_large_image"/>
					<meta name="twitter:title" content="${pageTitle}"/>
					<meta name="twitter:description" content="${config.description}"/>`
			);

			html += (`
					</head>
				</html>`
			);

			res.setHeader("content-type", "text/html");
			res.send(html);
		});
	} else {
		res.json(piece);
	}
};

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
	res.sendFile(req.resData.thumbnailPath, sendFileOptions);
};

exports.getImage = (req, res) => {
	res.sendFile(path.join(`${contentDir}/series/${req.params.slug}/${req.params.filename}`), sendFileOptions);
};

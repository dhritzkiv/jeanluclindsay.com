"use strict";

const path = require("path");
const fs = require("fs");
const Remarkable = require("remarkable");
const md = new Remarkable("commonmark");

const contentDir = path.join(process.cwd(), "content");
const bioDocument = "about.md";

exports.getBio = (req, res, next) => {
	fs.readFile(path.join(contentDir, bioDocument), "utf8", (err, file) => {

		if (err) {
			return next(err);
		}

		const html = md.render(file);

		res.json({
			bio: html
		});
	});
};

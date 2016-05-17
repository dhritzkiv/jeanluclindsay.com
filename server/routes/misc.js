"use strict";

const path = require("path");
const fs = require("fs");
const Remarkable = require("remarkable");
const md = new Remarkable("commonmark");
const cache = require(path.join(process.cwd(), "misc", "weak-cache.js"));

const projectRoot = path.join(process.cwd(), "..");
const contentDir = path.join(projectRoot, "content");
const bioDocument = "about.md";

const BIO_CACHE_KEY = "bio";

exports.getBio = (req, res, next) => {
	let bio = cache.get(BIO_CACHE_KEY);
	
	if (bio) {
		return res.json(bio);
	}
	
	fs.readFile(path.join(contentDir, bioDocument), "utf8", (err, file) => {

		if (err) {
			return next(err);
		}

		const html = md.render(file);
		
		bio = {
			bio: html
		};
		
		cache.set(BIO_CACHE_KEY, bio);
		res.json(bio);
	});
};

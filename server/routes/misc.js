"use strict";

const path = require("path");
const fs = require("fs");
const Remarkable = require("remarkable");
const md = new Remarkable("commonmark");
const cache = require(path.join(process.cwd(), "misc", "weak-cache.js"));

const projectRoot = path.join(process.cwd(), "..");
const contentDir = path.join(projectRoot, "content");

const bioDocumentName = "about.md";
const contactDocumentName = "contact.md";

const BIO_CACHE_KEY = "bio";
const CONTACT_CACHE_KEY = "contact";

exports.getBio = (req, res, next) => {
	let bio = cache.get(BIO_CACHE_KEY);

	if (bio) {
		return res.json(bio);
	}

	fs.readFile(path.join(contentDir, bioDocumentName), "utf8", (err, file) => {

		if (err) {
			return next(err);
		}

		const html = md.render(file);

		bio = {
			body: html
		};

		cache.set(BIO_CACHE_KEY, bio);
		res.json(bio);
	});
};

exports.getContact = (req, res, next) => {
	let contact = cache.get(CONTACT_CACHE_KEY);

	if (contact) {
		return res.json(contact);
	}

	fs.readFile(path.join(contentDir, contactDocumentName), "utf8", (err, file) => {

		if (err) {
			return next(err);
		}

		const html = md.render(file);

		contact = {
			body: html
		};

		cache.set(CONTACT_CACHE_KEY, contact);
		res.json(contact);
	});
};

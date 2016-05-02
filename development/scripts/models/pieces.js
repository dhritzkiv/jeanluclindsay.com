"use strict";

const Collection = require("ampersand-collection");
const PieceModel = require("./piece.js");

module.exports = Collection.extend({
	model: PieceModel
});
"use strict";

//A reusable mixin for providing sensible default ajax headers: JSON Content-Type.

module.exports = {
	ajaxConfig: {
		headers: {
			'Accept': "application/json",
			'Content-Type': "application/json"
		}
	}
};

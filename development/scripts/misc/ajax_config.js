"use strict";

//A reusable mixin for providing sensible default ajax headers: JSON Content-Type.

export default {
	ajaxConfig: {
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		}
	}
};

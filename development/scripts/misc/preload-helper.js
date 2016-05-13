"use strict";

export default (toLoad, callback) => {
	let loaded = 0;
	
	return () => {
		loaded++;
		
		if (loaded === toLoad) {
			callback();
		}
	};
};
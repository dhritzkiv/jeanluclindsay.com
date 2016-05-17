"use strict";

const CACHE_PERIOD = 1000 * 60;//1 minute;

const store = new WeakMap();
let lastDate = new Date(0);//epoch

const cache = {
	_internalGet() {
		const currentDate = new Date();
		const nextDate = new Date();

		nextDate.setTime(lastDate.getTime() + CACHE_PERIOD);

		let data = {};

		if (currentDate < nextDate) {
			//cache hit
			data = store.get(lastDate);
		} else {
			//cache miss
			lastDate = currentDate;
			store.set(lastDate, data);
		}

		return data;
	},

	get(name) {
		const data = cache._internalGet();

		if (data && data[name]) {
			return data[name];
		} else {
			return null;
		}
	},

	set(name, value) {
		const data = cache._internalGet();

		data[name] = value;
	}
};

module.exports = cache;

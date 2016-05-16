"use strict";

const environment = process.env.NODE_ENV || "development";

const config = {
	port: 2039,
	hostname: "http://localhost:2039",
	sentry_dsn_client: "https://a3dba8a45490482fb632951b6eb60cc2@app.getsentry.com/78389"
};

if (environment === "production") {
	config.hostname = "https://jeanluclinsday.com";
}

config.sentry_dsn_server = process.env.SENTRY_DSN_SERVER || config.sentry_dsn_client;

module.exports = config;
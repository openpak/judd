// OpenPak: configuration comes from the environment; config.json stays as a fallback.
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'config.json');
const fileConfig = fs.existsSync(file) ? require(file) : {};

module.exports = {
	http: {
		port: Number(process.env.JUDD_HTTP_PORT) || fileConfig.http?.port || 1234,
		// read API for SplatNet: internal network only, never behind the console hostnames
		apiPort: Number(process.env.JUDD_API_PORT) || 20141
	},
	mongoose: {
		connection_string: process.env.JUDD_MONGO_CONNECTION_STRING || fileConfig.mongoose?.connection_string,
		options: fileConfig.mongoose?.options || {}
	}
};

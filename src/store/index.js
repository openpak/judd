// Backend switch: JUDD_DATABASE_URL set -> Postgres, otherwise legacy Mongo (rollback path).
const config = require('../config');

function createStore() {
	if (config.postgres.url) return require('./postgres').createPostgresStore(config.postgres.url);
	return require('./mongo').createMongoStore();
}

module.exports = { createStore };

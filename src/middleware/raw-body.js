const express = require('express');

const rawBodyMiddleware = express.raw({
	type: '*/*',
	limit: '8mb',
	verify(request, response, buffer, encoding) {
		request.rawBody = buffer;
	}
});

module.exports = rawBodyMiddleware;
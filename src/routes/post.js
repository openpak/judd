const router = require('express').Router();
const titles = require('../titles');

router.post('/post', async (request, response, next) => {
	const title = titles[request.titleCode];

	try {
		await request.app.locals.store.saveResult({
			type: title.type,
			bossUniqueId: request.headers['x-boss-uniqueid'],
			bossDigest: request.headers['x-boss-digest'],
			resultData: request.resultData
		});
	} catch (error) {
		return next(error);
	}
	

	return response.send('success');
});

module.exports = router;
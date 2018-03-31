var object = require('./models/contraceptive');

module.exports = function(app) {
	app.get('/api/data',
		function(req, res) {
			object.find(
				function(err, contraceptive) {
					if (err) {
						res.send(err);
					}
					res.json(contraceptive);
				}
			);
		}
	);
}
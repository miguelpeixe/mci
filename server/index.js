var fs = require('fs'),
	url = require('url'),
	express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request'),
	_ = require('underscore'),
	config = require('../config'),
	loadData = require('./data'),
	loadSocial = require('./social');

var dev = false;

/*
 * Load data
 */

if(!fs.existsSync('dist/data/events.json')) {
	loadData(init);
} else {
	init();
}

/*
 * Run app
 */

function init() {

	/*
	 * Download data each 10 minutes
	 */
	if(!dev) {
		setInterval(function() {
			loadData(null, true);
		}, 1000 * 60 * 10);
	}

	var app = express();

	app.use(require('prerender-node'));
	app.use(require('compression')());
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/../src/views/');

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	app.use('/', express.static(__dirname + '/../dist'));

	app.all('/api/reqHeader', function(req, res) {
		var url = req.body.url;
		delete req.body.url;
		request({
			url: url,
			qs: req.body
		}, function(req, response, body) {
			res.send(response.headers);
		});
	});

	var options = fs.existsSync('./options.json') ? JSON.parse(fs.readFileSync('./options.json', 'utf8')) : {};

	app.get('/api/data', function(req, res) {

		var data = {
			config: {
				wpUrl: config.wpUrl,
				hashtag: config.hashtag
			},
			options: options,
			events: require('../dist/data/events.json'),
			spaces: require('../dist/data/spaces.json')
		};

		res.send(data);

	});

	var loadedEvents = [];

	app.get('/api/event/:eventId', function(req, res) {
		var eventId = req.params.eventId;
		var eventSelect = [
			'id',
			'location',
			'name',
			'_type',
			'shortDescription',
			'longDescription',
			'createTimestamp',
			'status',
			'isVerified',
			'parent',
			'children',
			'owner',
			'emailPublico',
			'emailPrivado',
			'telefonePublico',
			'telefone1',
			'telefone2',
			'acessibilidade',
			'capacidade',
			'endereco',
			'site',
			'twitter',
			'facebook',
			'googleplus'
		];
		var eventReq = {
			url: config.apiUrl + '/event/find',
			qs: {
				'@select': eventSelect.join(','),
				'@files': '(gallery)',
				'id': 'EQ(' + eventId + ')' 
			}
		}

		var loaded = _.find(loadedEvents, function(e) { return e.id == eventId; });

		// 10 minutes cache
		if(!loaded || (loaded._age + (1000 * 60 * 10)) < new Date().getTime()) {
			if(loaded) {
				loadedEvents = _.without(loadedEvents, loaded);
			}
			request(eventReq, function(reqErr, reqRes, body) {
				if(reqErr) {
					res.send(reqErr);
				} else {
					var e = JSON.parse(body)[0];
					if(!e || typeof e == 'undefined')
						e = {};
					else {
						e._age = new Date().getTime();
						loadedEvents.push(e);
					}
					res.send(e);
				}
			});

		} else {
			res.send(loaded);
		}

	});

	app.all('/agenda/limpar-cache', function(req, res) {

		if(config.password && (!req.body.password || req.body.password !== config.password)) {

			var resData = {};

			if(req.body.password) {
				resData = {
					error: 'Senha incorreta'
				};
			}

			res.render('static/password-protected', resData);

		} else {

			var emptied = loadedEvents.slice(0);
			loadedEvents = [];

			res.render('static/cache-cleared', {
				time: new Date().toString(),
				events: emptied
			});

		}

	});

	app.all('/agenda/atualizar', function(req, res) {

		if(config.password && (!req.body.password || req.body.password !== config.password)) {

			var resData = {};

			if(req.body.password) {
				resData = {
					error: 'Senha incorreta'
				};
			}

			res.render('static/password-protected', resData);

		} else {

			loadedEvents = [];
			loadData(function() {

				res.render('static/data-success', {time: new Date().toString() });

			}, true);
		}

	});

	/*
	 * Update social data each 10 minutes
	 */

	if(config.hashtag) {

		var social = [];
		loadSocial(function(data) {
			social = data;
		});
		if(!dev) {
			setInterval(function() {
				loadSocial(function(data) {
					social = data;
				});
			}, 1000 * 60 * 10);
		}

		app.get('/api/social', function(req, res) {

			var perPage = parseInt(req.query.perPage || 20);
			var page = parseInt(req.query.page || 1);
			var offset = (page-1) * perPage;

			if(offset > social.length) {
				res.status(404).send('Not found');
			} else {
				res.send({
					pagination: {
						currentPage: parseInt(page),
						perPage: parseInt(perPage),
						totalPages: Math.floor(social.length/perPage)
					},
					data: social.slice(offset, offset+perPage)
				});
			}

		});

	}

	app.get('/*', function(req, res) {
		res.sendfile('dist/views/index.html');
	});

	var port = process.env.PORT || 8000;

	app.listen(port);

	console.log('App started on port ' + port);

}
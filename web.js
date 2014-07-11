var express = require('express'),
	request = require('request'),
	_ = require('underscore'),
	config = require('./config');

var app = express();

app.use(require('prerender-node'));

app.use('/', express.static(__dirname + '/dist'));

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

	loaded = false;

	// 10 minutes cache
	if(!loaded || (loaded._age + (1000 * 60 * 10)) < new Date().getTime()) {
		if(loaded) {
			loadedEvents = _.without(loadedEvents, loaded);
		}
		request(eventReq, function(reqErr, reqRes, body) {
			if(reqErr) {
				res.send(reqErr);
			} else {
				//res.send(body);
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

app.get('/*', function(req, res) {
	res.sendfile('dist/index.html');
});

var port = process.env.PORT || 8000;

app.listen(port);

console.log('App started on port ' + port);
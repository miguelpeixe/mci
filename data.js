#!/usr/bin/env node

var fs = require('fs'),
	request = require('request'),
	_ = require('underscore'),
	config = require('./config');

function getData() {

	var eventsReqUrl = config.apiUrl + '/event/find?@select=id,name,shortDescription,description,classificacaoEtaria,terms,traducaoLibras,descricaoSonora&@files=(avatar.viradaSmall,avatar.viradaBig):url&project=EQ(@Project:' + config.projectId + ')';

	console.log('Baixando eventos...');
	request(eventsReqUrl, function(err, res, body) {
		if(err) {
			console.log(err);
		} else {
			fs.writeFile('dist/events.json', body, function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log('Eventos atualizados');
				}
			});
		}
	});

}

getData();
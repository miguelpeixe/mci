#!/usr/bin/env node

var fs = require('fs'),
	request = require('request'),
	_ = require('underscore'),
	config = require('./config');

function getData() {

	var storeDir = 'dist/data';

	var defaultReq = {
		method: 'GET'
	};

	var eventsReq = {
		url: config.apiUrl + '/event/find',
		qs: {
			'@select': 'id,name,shortDescription,description,classificacaoEtaria,terms,traducaoLibras,descricaoSonora',
			'@files': '(avatar.viradaSmall,avatar.viradaBig):url',
			'project': 'eq(@Project:' + config.projectId + ')'
		}
	};

	console.log('Baixando eventos...');

	request(_.extend(defaultReq, eventsReq), function(err, res, body) {
		if(err) {
			console.log(err);
		} else {

			var events = JSON.parse(body);
			var eventIds = [];

			_.each(events, function(event) {
				eventIds.push(event.id);
			});

			eventIds = eventIds.join(',');

			var occursReq = {
				url: config.apiUrl + '/eventOccurrence/find?event=in(' + eventIds + ')',
				qs: {
					'@select': 'id,eventId,rule',
					'@order': '_startsAt'
				}
			};

			console.log('Baixando ocorrências dos eventos...');

			var occursReqUrl = config.apiUrl + '/eventOccurrence/find?@select=id,eventId,rule&event=in(' + eventIds + ')&@order=_startsAt';

			request(occursReqUrl, function(err, res, body) {

				if(err) {

					console.log(err);

				} else {

					var occurrences = JSON.parse(body);

					var spaceIds = [];

					_.each(occurrences, function(occurrence) {

						// Store event id
						spaceIds.push(occurrence.rule.spaceId);

						// Connect to event (?)
						// var event = _.find(events, function(e) { return e.id == occurrence.eventId; });
						// if(!event.occurrences)
						// 	event.occurrences = [];
						// event.occurrences.push(occurrence);

					});

					// remove duplicates
					spaceIds = _.uniq(spaceIds).join(',');

					var spacesReq = {
						url: config.apiUrl + '/space/find',
						qs: {
							'@select': 'id,name,shortDescription,endereco,location',
							'@files': '(avatar.viradaSmall,avatar.viradaBig):url',
							'id': 'in(' + spaceIds + ')',
							'@order': 'name'
						}
					};

					console.log('Baixando espaços das ocorrências...');

					request(_.extend(defaultReq, spacesReq), function(err, res, body) {

						if(err) {
							console.log(err);
						} else {

							var spaces = JSON.parse(body);

							fs.writeFile(storeDir + '/events.json', JSON.stringify(events), function(err) {
								if(err) {
									console.log(err);
								} else {
									console.log('Eventos atualizados');
								}
							});

							fs.writeFile(storeDir + '/occurrences.json', JSON.stringify(occurrences), function(err) {
								if(err) {
									console.log(err);
								} else {
									console.log('Ocorrências atualizadas');
								}
							});

							fs.writeFile(storeDir + '/spaces.json', JSON.stringify(spaces), function(err) {
								if(err) {
									console.log(err);
								} else {
									console.log('Espaços atualizados');
								}
							});

						}

					})
				}
			});
		}
	});

}

getData();
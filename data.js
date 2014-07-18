#!/usr/bin/env node

var fs = require('fs'),
	request = require('request'),
	_ = require('underscore'),
	moment = require('moment'),
	config = require('./config');

module.exports = function(cb, silent) {

	var storeDir = 'dist/data';

	var defaultReq = {
		method: 'GET'
	};

	var eventsReq = {
		url: config.apiUrl + '/event/find',
		qs: {
			'@select': 'id,name,shortDescription,description,classificacaoEtaria,terms,traducaoLibras,descricaoSonora',
			'@files': '(avatar,header):url',
			'project': 'in(@Project:' + config.projectId + ')'
		}
	};

	if(!silent)
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

			if(!silent)
				console.log('Baixando ocorrências dos eventos...');

			var occursReqUrl = config.apiUrl + '/eventOccurrence/find?@select=id,eventId,rule&event=in(' + eventIds + ')&@order=_startsAt';

			request(occursReqUrl, function(err, res, body) {

				if(err) {

					console.log(err);

				} else {

					var occurrences = JSON.parse(body);

					var spaceIds = [];

					_.each(occurrences, function(occurrence) {

						// Store space id for following spaces request
						spaceIds.push(occurrence.rule.spaceId);

						// Find event
						var event = _.find(events, function(e) { return e.id == occurrence.eventId; });

						// Push occurrence to event
						if(!event.occurrences)
							event.occurrences = [];

						event.occurrences.push(occurrence.rule);

						event.acessibilidade = [];
						if(event.traducaoLibras)
							event.acessibilidade.push('Tradução para libras');
						if(event.descricaoSonora)
							event.acessibilidade.push('Descrição sonora');

					});

					// Remove events without occurrence
					events = _.filter(events, function(e) { return e.occurrences && e.occurrences.length; });

					// Organize event by time of first occurrence
					events = _.sortBy(events, function(e) {
						return moment(e.occurrences[0].startsOn + ' ' + e.occurrences[0].startsAt, 'YYYY-MM-DD HH:mm').unix();
					});

					// Remove duplicate spaces
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

					if(!silent)
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
									if(!silent)
										console.log('Eventos atualizados');
								}
							});

							fs.writeFile(storeDir + '/occurrences.json', JSON.stringify(occurrences), function(err) {
								if(err) {
									console.log(err);
								} else {
									if(!silent)
										console.log('Ocorrências atualizadas');
								}
							});

							fs.writeFile(storeDir + '/spaces.json', JSON.stringify(spaces), function(err) {
								if(err) {
									console.log(err);
								} else {
									if(!silent)
										console.log('Espaços atualizados');
								}
							});

							if(typeof cb == 'function')
								cb();

						}

					})
				}
			});
		}
	});

};

if(!module.parent) {
	module.exports();
}
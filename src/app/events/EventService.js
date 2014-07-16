'use strict';

var moment = require('moment');
require('moment/lang/pt-br');
moment.lang('pt-BR');

module.exports = [
	'$http',
	'$q',
	'$window',
	function($http, $q, $window) {

		var today = moment('2014-05-18 10:00', 'YYYY-MM-DD HH:mm');

		var events = $window.events;
		var spaces = $window.spaces;

		var userCoords = false;

		var getUserCoords = function() {
			var defer = $q.defer();
			if(!userCoords && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(pos) {
					userCoords = pos.coords;
					defer.resolve(userCoords);
				});
			} else if(userCoords) {
				defer.resolve(userCoords);
			} else {
				defer.reject('Not supported');
			}
			return defer.promise;
		};

		// Populate events timestamp
		_.each(events, function(e) {
			e._timestamp = moment(e.startsOn + ' ' + e.startsAt, 'YYYY-MM-DD HH:mm').unix();
		});

		var getDistance = function(origin, destination) {

			origin = L.latLng(origin.latitude, origin.longitude);
			destination = L.latLng(destination.latitude, destination.longitude);

			return origin.distanceTo(destination);

		}

		return {
			getToday: function() {
				return today;
			},
			getEvents: function() {
				return events;
			},
			getEventsBy: function(key, value) {
				return _.filter(events, function(e) { return e[key] == value; });
			},
			getSpaces: function() {
				return spaces;
			},
			getTaxTerms: function(tax) {
				var terms = [];
				_.each(this.getEvents(), function(e) {
					terms = terms.concat(e.terms[tax]);
				});
				return _.sortBy(_.uniq(terms), function(t) { if(t == 'Outros') return 'zzzzzzz'; else return t; });
			},
			getSpaceDistance: function(space) {
				var distance = $q.defer();
				getUserCoords().then(function(coords) {
					distance.resolve(getDistance(coords, space.location));
				});
				return distance.promise;
			},
			getEvent: function(eventId) {
				var event = _.find(events, function(e) { return e.id == eventId; });
				if(!event)
					event = {};
				var deferred = $q.defer();
				if(!event._loaded) {
					$http.get('/api/event/' + eventId).success(function(data) {
						event = _.extend(event, data);
						event._loaded = true;
						deferred.resolve(event);
					});
				} else {
					deferred.resolve(event);
				}
				return deferred.promise;
			},
			getEventSpace: function(event) {
				return _.find(spaces, function(s) { return s.id == event.spaceId; });	
			},
			getEventMoment: function(e) {
				return moment(e.startsOn + ' ' + e.startsAt, 'YYYY-MM-DD HH:mm');
			},
			getFutureEvents: function(amount, src) {

				var self = this;

				src = src || events;
				amount = amount || events.length;

				var i = 0;

				return _.filter(src, function(e) {
					if(self.getEventMoment(e).isAfter(today) && i < amount) {
						i++;
						return true;
					}
					return false;
				});

			}
		}

	}
];
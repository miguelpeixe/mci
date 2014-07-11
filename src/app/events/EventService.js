'use strict';

var moment = require('moment');
require('moment/lang/pt-br');
moment.lang('pt-BR');

module.exports = [
	'$http',
	'$q',
	'$window',
	function($http, $q, $window) {

		var events = $window.events;
		var spaces = $window.spaces;

		// Populate events timestamp
		_.each(events, function(e) {
			e._timestamp = moment(e.startsOn + ' ' + e.startsAt, 'YYYY-MM-DD HH:mm').unix();
		});

		var today = moment('2014-05-18 10:00', 'YYYY-MM-DD HH:mm');

		var getDistance = function(origin, destination) {

			origin = L.latLng(origin.latitude, origin.longitude);
			destination = L.latLng(destination.latitude, destination.longitude);

			return origin.distanceTo(destination);

		}

		var isWithinBounds = function(origin, destination, radius) {

			var distance = getDistance(origin, destination);

			if(distance < radius)
				return true;
			else
				return false;

		};

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
			getSpaceDistance: function(space) {
				var distance = $q.defer();
				if(navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(pos) {
						distance.resolve(getDistance(pos.coords, space.location));
					}, function(err) {
						distance.reject(err);
					});
				} else {
					distance.reject('Not supported');
				}
				return distance.promise;
			},
			getNearSpaces: function() {
				var spaces = $q.defer();
				var radius = 3000;
				if(navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(pos) {
						var near = _.filter(spaces, function(space) {
							if(space._distance)
								return space._distance < radius;
							else
								return isWithinBounds(pos.coords, space.location, radius);
						});
						spaces.resolve(near);
					}, function(err) {
						spaces.reject(err);
					});
				} else {
					spaces.reject('Not supported');
				}
				return spaces.promise;
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
			getCloseEvents: function(amount, events) {

				events = events || events;
				amount = amount || events.length;

				var i = 0;

				return _.filter(events, function(e) {
					if(moment(e.startsOn + ' ' + e.startsAt, 'YYYY-MM-DD HH:mm').isAfter(today) && i < amount) {
						i++;
						return true;
					}
					return false;
				});

			}
		}

	}
];
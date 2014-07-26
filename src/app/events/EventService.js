'use strict';

module.exports = [
	'$http',
	'$q',
	'$window',
	function($http, $q, $window) {

		var today = moment('2014-05-18 10:10', 'YYYY-MM-DD HH:mm');

		var options = $window.options;

		var events = $window.events;

		var spaces = $window.spaces;

		var occurrences = [];

		// Populate events occurrences with timestamp and moment
		_.each(events, function(e) {
			_.each(e.occurrences, function(occur) {
				occur.moment = moment(occur.startsOn + ' ' + occur.startsAt, 'YYYY-MM-DD HH:mm');
				occur.timestamp = occur.moment.unix();
				occur.isFuture = occur.timestamp >= today.unix();
				occurrences.push(occur);
			});
		});

		// Sort events by occurrences
		events = _.sortBy(events, function(e) {
			var next;
			_.each(e.occurrences, function(occur) {
				if(occur.isFuture && !next)
					next = occur.timestamp;
			});
			return next;
		});

		// Populate occurrences with space name
		_.each(occurrences, function(occur) {
			var space = _.find(spaces, function(s) { return s.id == occur.spaceId; });
			if(space)
				occur.spaceName = space.name;
		});

		// Sort occurrences by timestamp
		occurrences = _.sortBy(occurrences, function(o) { return o.timestamp; });

		var isHappening = _.find(occurrences, function(o) { return o.isFuture; }) ? true : false;

		var userCoords = false;

		var getUserCoords = function() {
			var defer = $q.defer();
			if(!userCoords && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(pos) {
					userCoords = pos.coords;
					//userCoords = { latitude: 2, longitude: 2 };
					defer.resolve(userCoords);
				});
			} else if(userCoords) {
				defer.resolve(userCoords);
			} else {
				defer.reject('Not supported');
			}
			return defer.promise;
		};

		var getDistance = function(origin, destination) {

			origin = L.latLng(origin.latitude, origin.longitude);
			destination = L.latLng(destination.latitude, destination.longitude);

			return origin.distanceTo(destination);

		}

		return {
			isHappening: function() {
				return isHappening;
			},
			getToday: function() {
				return today;
			},
			getOccurrences: function() {
				return occurrences;
			},
			getEvents: function() {
				return events;
			},
			getEventsBy: function(key, value) {
				return _.filter(events, function(e) { return e[key] == value; });
			},
			getTagDescription: function(tagName) {
				if(options.tags) {
					var tag = _.find(options.tags, function(t) { return t.name == tagName; });
					if(tag && tag.description) {
						return tag.description;
					}
				}
				return false;
			},
			getEventsByDateRange: function(from, to, src) {
				to = to || from;
				src = src || events;
				from = moment(from).unix();
				to = moment(to).add('days', 1).unix();
				return _.filter(src, function(e) {
					e.filteredOccurrences = _.filter(e.occurrences, function(occur) {
						return occur.timestamp <= to && occur.timestamp >= from;
					});
					return e.filteredOccurrences.length;
				});
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
			initUserLocation: function() {
				var deferred = $q.defer();
				getUserCoords().then(function(coords) {
					deferred.resolve(coords);
				});
				return deferred.promise;
			},
			getSpaceDistance: function(space) {
				// var distance = $q.defer();
				// getUserCoords().then(function(coords) {
				// 	distance.resolve(getDistance(coords, space.location));
				// });
				// return distance.promise;
				if(userCoords) {
					return getDistance(userCoords, space.location);
				} else {
					return false;
				}
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
			getOccurrenceSpace: function(occur) {
				return _.find(spaces, function(s) { return s.id == occur.spaceId; });
			},
			getOccurrenceEvent: function(occur) {
				return _.find(events, function(e) { return e.occurrences.indexOf(occur) !== -1; });
			},
			getFutureEvents: function(amount, src) {

				var self = this;

				src = src || events;
				amount = amount || events.length;

				var i = 0;

				return _.filter(src, function(e) {
					if(e.occurrences[e.occurrences.length-1].moment.isAfter(today) && i < amount) {
						i++;
						return true;
					}
					return false;
				});

			}
		}

	}
];
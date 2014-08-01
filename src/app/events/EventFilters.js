'use strict';

angular.module('mci.events')

.filter('tagEvents', [
	'EventService',
	function(Event) {
		return function(input, tag) {
			if(tag) {
				return _.filter(input, function(e) {
					return e.terms.tag && e.terms.tag.indexOf(tag) !== -1;
				});
			}
			return input;
		}
	}
])

.filter('spaceEvents', [
	'EventService',
	function(Event) {
		return function(input, space) {
			if(space && space.id) {
				return _.filter(input, function(e) {
					var occurrences = _.filter(e.occurrences, function(occur) {
						var occurSpace = Event.getOccurrenceSpace(occur);
						if(occurSpace && occurSpace.id == space.id) {
							return true;
						}
						return false;
					});
					return occurrences.length;
				});
			}
			return input;
		}
	}
])

.filter('spaceOccurrences', [
	'EventService',
	function(Event) {
		return function(input, space) {
			if(space && space.id) {
				return _.filter(input, function(occur) {
					var occurSpace = Event.getOccurrenceSpace(occur);
					if(occurSpace && occurSpace.id == space.id) {
						return true;
					}
					return false;
				});
			}
			return input;
		}
	}
])

.filter('futureEvents', [
	'EventService',
	function(Event) {
		return function(input, future) {
			if(future) {
				var now = Event.getToday().unix();
				return _.filter(input, function(e) {
					if(e.occurrences[e.occurrences.length-1].timestamp > now) {
						return true;
					} else {
						return false;
					}
				});
			}
			return input;
		};
	}
])

.filter('futureOccurrences', [
	'EventService',
	function(Event) {
		return function(input, future) {
			if(future) {
				var now = Event.getToday().unix();
				return _.sortBy(_.filter(input, function(occurrence) {
					return occurrence.timestamp > now;
				}), function(occur) { return -occur.timestamp; });
			}
			return _.sortBy(input, function(occur) { return occur.timestamp; });
		};
	}
])

.filter('byDateEvents', [
	'EventService',
	function(Event) {
		return function(input, from, to) {
			if(from) {
				to = to || from;
				from = moment(from).unix();
				to = moment(to).add('days', 1).unix();
				return _.filter(input, function(e) {
					var occurrences = _.filter(e.occurrences, function(occur) {
						return occur.timestamp <= to && occur.timestamp >= from;
					});
					return occurrences.length;
				});
			} else {
				return input;
			}
		}
	}
])

.filter('byDateOccurrences', [
	'EventService',
	function(Event) {
		return function(input, from, to) {
			if(from) {
				to = to || from;
				from = moment(from).unix();
				to = moment(to).add('days', 1).unix();
				return _.filter(input, function(occur) {
					return occur.timestamp <= to && occur.timestamp >= from;
				});
			} else {
				return input;
			}
		}
	}
]);
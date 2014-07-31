'use strict';

module.exports = [
	'$q',
	'$interval',
	'$timeout',
	'$state',
	'EventService',
	'$scope',
	function($q, $interval, $timeout, $state, Event, $scope) {

		// Change state to single event
		$scope.accessEvent = function(e) {
			$state.go('eventsSingle', {eventId: e.id});
		}

		// notworking
		$scope.showFromNow = function(event) {
			var limit = 1000 * 60 * 60 * 4; // Four hours in milliseconds
			return event._timestamp <= Event.getToday().unix() + limit;
		};

		$scope.getOccurrences = function(e) {
			var occurrences = e.occurrences;
			// TO FIX
			// if($scope.eventSearch.startDate) {
			// 	occurrences = e.filteredOccurrences;
			// } else if($scope.isFutureEvents) {
			// 	occurrences = _.filter(e.occurrences, function(occur) {
			// 		return occur.isFuture;
			// 	});
			// } else {
			// 	occurrences = e.occurrences;
			// }
			// occurrences = _.sortBy(occurrences, function(occur) {
			// 	if(occur.isFuture) {
			// 		return -occur.timestamp;
			// 	} else {
			// 		return occur.timestamp;
			// 	}
			// });
			return occurrences;
		};

	}
];
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

		// Limit fromNow to show from now to 4h
		var today = Event.getToday();
		var todayUnix = today.unix();
		var limit = today.unix() + (60*60*4);
		$scope.showFromNow = function(occur) {
			return occur.timestamp >= todayUnix && occur.timestamp <= limit;
		};

		$scope.getFormattedDate = function(occurrence) {
			return occurrence.moment.calendar(today);
		};

		$scope.getOccurrences = function(e) {
			var occurrences = e.occurrences;
			if($scope.$parent.eventSearch && $scope.$parent.eventSearch.startDate) {
				occurrences = e.filteredOccurrences;
			} else if($scope.isFutureEvents || $scope.$parent.isFutureEvents) {
				occurrences = _.filter(e.occurrences, function(occur) {
					return occur.isFuture;
				});
			}
			occurrences = _.sortBy(occurrences, function(occur) {
				if(occur.isFuture) {
					return -occur.timestamp;
				} else {
					return occur.timestamp;
				}
			});
			return occurrences;
		};

	}
];
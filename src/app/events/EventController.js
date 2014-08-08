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

		$scope.accessSpace = function(spaceId) {
			$state.go('events.filter', {space: spaceId, past: 1}, {inherit: false});
		}

		$scope.accessLinguagem = function(linguagem) {
			$state.go('events.filter', {linguagem: linguagem, past: 1}, {inherit: false});
		}

		$scope.accessTag = function(tag) {
			$state.go('events.filter', {tag: tag, past: 1}, {inherit: false});
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

	}
];
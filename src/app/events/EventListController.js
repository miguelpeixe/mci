'use strict';

module.exports = [
	'EventService',
	'$scope',
	function(Event, $scope) {

		$scope.service = Event;

		$scope.events = Event.getEvents();

		$scope.spaces = Event.getSpaces();

		$scope.showFromNow = function(event) {
			var limit = 1000 * 60 * 60 * 4; // Four hours in milliseconds
			console.log(event._timestamp);
			return event._timestamp <= Event.getToday().unix() + limit;
		};

		_.each($scope.spaces, function(space) {
			Event.getSpaceDistance(space).then(function(d) {
				space._distance = d;
				space.kmDistance = Math.round(d/10)/100;
			});
		});

		$scope.futureEvents = function() {
			_.each($scope.spaces, function(space) {
				space.events = Event.getCloseEvents(null, _.filter($scope.events, function(e) { return e.spaceId == space.id; }));
			});
		};

		$scope.allEvents = function() {
			_.each($scope.spaces, function(space) {
				space.events = _.filter($scope.events, function(e) { return e.spaceId == space.id; });
			});
		};

		// Init with next events
		$scope.futureEvents();

		// Not working
		$scope.$watch('eventSearch', function() {
			_.each($scope.spaces, function(s) {
				if(!s.events.length) {
					s._empty = true;
				} else {
					s._empty = false;
				}
			});
		}, true);

		$scope.$watch('spaces', function() {
			_.each($scope.spaces, function(s) {
				if(!s.events.length) {
					s._empty = true;
				} else {
					s._empty = false;
				}
			});
		}, true);

	}
];
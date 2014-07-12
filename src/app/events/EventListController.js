'use strict';

module.exports = [
	'$q',
	'$interval',
	'EventService',
	'$scope',
	function($q, $interval, Event, $scope) {

		$scope.service = Event;

		$scope.events = Event.getEvents();

		$scope.spaces = Event.getSpaces();

		$scope.futureEvents = function() {
			_.each($scope.spaces, function(space) {
				space.events = Event.getFutureEvents(null, _.filter($scope.events, function(e) { return e.spaceId == space.id; }));
			});
		};

		$scope.allEvents = function() {
			_.each($scope.spaces, function(space) {
				space.events = _.filter($scope.events, function(e) { return e.spaceId == space.id; });
			});
		};

		// Init with next events
		$scope.futureEvents();

		// notworking
		$scope.showFromNow = function(event) {
			var limit = 1000 * 60 * 60 * 4; // Four hours in milliseconds
			return event._timestamp <= Event.getToday().unix() + limit;
		};

		var distancePromises = [];
		_.each($scope.spaces, function(space) {
			var ready = $q.defer();
			distancePromises.push(ready.promise);
			Event.getSpaceDistance(space).then(function(d) {
				ready.resolve();
				space._distance = d;
				space.kmDistance = Math.round(d/10)/100;
			});
		});

		$scope.featuredEvent = function(offset) {

			var spaceOffset = _.random(0, 2);

			var orderedSpaces = _.sortBy($scope.spaces, function(s) { return s._distance; });
			orderedSpaces = _.filter(orderedSpaces, function(s) { return s.events.length; });

			var closestSpace = orderedSpaces[spaceOffset];

			if(closestSpace._distance > 10 * 1000)
				return false;

			var events = Event.getFutureEvents(null, _.filter(closestSpace.events, function(e) { return e.spaceId == closestSpace.id; }));

			var eventOffset = _.random(0, 3);

			var event = events[eventOffset] || events[events.length-1];

			event.space = closestSpace;

			event.fromNow = Event.getEventMoment(event).from(Event.getToday());

			return event;

		};

		$q.all(distancePromises).then(function() {
			//$interval(function() {
				$scope.featured = $scope.featuredEvent();
			//}, 8000);
		});

		/*
		 * NAVIGATION
		 */

		var nav = function(list, perPage) {

			return {
				perPage: perPage,
				curPage: 0,
				offset: 0,
				pageCount: function() {
					return Math.ceil(eval('$scope.' + list).length/this.perPage)-1;
				},
				nextPage: function() {
					console.log(this.pageCount());
					if(this.curPage < this.pageCount())
						this.curPage++;
				},
				prevPage: function() {
					if(this.curPage > 0)
						this.curPage--;
				}
			};

		};

		/*
		 * Space nav
		 */

		$scope.spaceNav = nav('filteredSpaces', 8);

		$scope.$watch('spaceSearch', function() {
			$scope.spaceNav.curPage = 0;
			$scope.spaceNav.offset = 0;
		});

		/*
		 * Event nav
		 */

		$scope.eventNav = nav('filteredEvents', 8);

		$scope.$watch('eventSearch', function() {
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
		});

	}
];
'use strict';

module.exports = [
	'$q',
	'$interval',
	'$state',
	'$stateParams',
	'EventService',
	'$scope',
	function($q, $interval, $state, $stateParams, Event, $scope) {

		$scope.service = Event;

		$scope.events = Event.getEvents();

		$scope.spaces = Event.getSpaces();

		$scope.linguagens = Event.getTaxTerms('linguagem');

		/*
		 * NAVIGATION
		 */

		var nav = function(list, perPage) {

			return {
				perPage: perPage,
				curPage: 0,
				offset: 0,
				pageCount: function() {
					return Math.ceil($scope.$eval(list).length/this.perPage)-1;
				},
				nextPage: function() {
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

		$scope.eventNav = nav('filteredEvents', 12);

		$scope.$watch('eventSearch.terms', function(terms, prevTerms) {
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
			if(terms || prevTerms) {
				$state.go('events.filter', _.extend($stateParams, {
					linguagem: terms
				}));
			}
		}, true);

		$scope.$watch('eventSearch.$', _.debounce(function(text, prevText) {
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
			if(text || prevText) {
				$state.go('events.filter', _.extend($stateParams, {
					search: text,
				}));
			}
		}, 600));

		/*
		 * Init search (filter) vals with state params
		 */

		$scope.eventSearch = {
			$: $state.params.search || '',
			terms: $state.params.linguagem || ''
		};

		$scope.isEventFiltering = function() {
			return $scope.eventSearch && ($scope.eventSearch.$ || $scope.eventSearch.terms);
		};

		$scope.futureEvents = function() {
			// clear navigation
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
			// get events
			$scope.events = Event.getFutureEvents();
			// update space data (?)
			_.each($scope.spaces, function(space) {
				space.events = angular.copy(_.filter($scope.events, function(e) { return e.spaceId == space.id; }));
			});
		};

		$scope.allEvents = function() {
			// clear navigation
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
			// get events
			$scope.events = Event.getEvents();
			// update space data (?)
			_.each($scope.spaces, function(space) {
				space.events = angular.copy(_.filter($scope.events, function(e) { return e.spaceId == space.id; }));
			});
		};

		// Init with next events
		$scope.futureEvents();

		// notworking
		$scope.showFromNow = function(event) {
			var limit = 1000 * 60 * 60 * 4; // Four hours in milliseconds
			return event._timestamp <= Event.getToday().unix() + limit;
		};

		/*
		 * Load space distances
		 */
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

		/*
		 * Featured event
		 */

		$scope.featuredEvent = function(offset) {

			var spaceOffset = _.random(0, 2);

			var orderedSpaces = _.sortBy($scope.spaces, function(s) { return s._distance; });

			orderedSpaces = _.filter(orderedSpaces, function(s) { return s.events.length; });

			var closestSpace = orderedSpaces[spaceOffset] || orderedSpaces[orderedSpaces.length-1];

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
			$scope.featured = $scope.featuredEvent();
		});

	}
];
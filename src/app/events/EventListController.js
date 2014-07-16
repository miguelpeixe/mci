'use strict';

var moment = require('moment');
require('moment/lang/pt-br');
moment.lang('pt-BR');

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

		$scope.accessEvent = function(e) {
			$state.go('eventsSingle', {eventId: e.id});
		}

		/*
		 * Init search (filter) vals with state params
		 */

		$scope.eventSearch = {
			$: $state.params.search || '',
			terms: $state.params.linguagem || '',
			startDate: $state.params.startDate || '',
			endDate: $state.params.endDate || '',
			isFuture: $state.params.future || ''
		};

		$scope.eventFilter = {
			$: $scope.eventSearch.$,
			terms: $scope.eventSearch.terms
		};

		/*
		 * NAVIGATION
		 */

		var nav = function(list, perPage, listContainer) {

			return {
				list: list,
				perPage: perPage,
				curPage: 0,
				offset: 0,
				pageCount: function() {
					return Math.ceil($scope.$eval(list).length/this.perPage)-1;
				},
				nextPage: function() {
					var self = this;
					if(this.curPage < this.pageCount()) {
						if(typeof listContainer !== 'undefined' && $(listContainer).length)
							$('html,body').animate({
								scrollTop: $(listContainer).position().top - 40
							}, 300);
						this.curPage++;
						$scope.$broadcast('mci.page.next', self);
					}
				},
				prevPage: function() {
					var self = this;
					if(this.curPage > 0) {
						if(typeof listContainer !== 'undefined' && $(listContainer).length)
							$('html,body').animate({
								scrollTop: $(listContainer).position().top - 40
							}, 300);
						this.curPage--;
						$scope.$broadcast('mci.page.prev', self);
					}
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

		$scope.eventNav = nav('filteredEvents', 12, '#event-list');

		// Not working
		if($state.params.page) {
			$scope.eventNav.curPage = $state.params.page-1;
		}

		// update pagination state
		$scope.$on('mci.page.next', function(ev, nav) {
			console.log(nav);
			if(nav.list == 'filteredEvents') {
				$state.go('events.filter', _.extend($stateParams, {
					page: nav.curPage + 1
				}));
			}
		});
		$scope.$on('mci.page.prev', function(ev, nav) {
			if(nav.list == 'filteredEvents') {
				$state.go('events.filter', _.extend($stateParams, {
					page: nav.curPage + 1
				}));
			}
		});

		// clear pagination when search changes
		$scope.$watch('eventSearch', function() {
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
		}, true);

		// update terms filter and state
		$scope.$watch('eventSearch.terms', function(terms, prevTerms) {
			$scope.eventFilter.terms = terms;
			if(terms || prevTerms) {
				$state.go('events.filter', _.extend($stateParams, {
					linguagem: terms
				}));
			}
		}, true);

		// update text search filter and clear pagination (parent object watch doesnt get search text changes)
		$scope.$watch('eventSearch.$', function(text) {
			$scope.eventNav.curPage = 0;
			$scope.eventNav.offset = 0;
			$scope.eventFilter.$ = text;
		});

		// update text search state
		$scope.$watch('eventSearch.$', _.debounce(function(text, prevText) {
			if(text || prevText) {
				$state.go('events.filter', _.extend($stateParams, {
					search: text,
				}));
			}
		}, 600));

		$scope.isEventFiltering = function() {
			return $scope.eventSearch && (
				$scope.eventSearch.$ ||
				$scope.eventSearch.terms ||
				$scope.eventSearch.startDate ||
				$scope.eventSearch.endDate ||
				$scope.eventSearch.isFuture
			);
		};

		$scope.isFutureEvents = false;

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
			$scope.isFutureEvents = true;
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
			$scope.isFutureEvents = false;
		};

		// Init with next events
		$scope.futureEvents();

		$scope.toggleFutureEvents = function() {

			if(!$scope.isFutureEvents) {
				$scope.futureEvents();
			} else {
				$scope.allEvents();
			}

		};

		// notworking
		$scope.showFromNow = function(event) {
			var limit = 1000 * 60 * 60 * 4; // Four hours in milliseconds
			return event._timestamp <= Event.getToday().unix() + limit;
		};

		/*
		 * Datepicker
		 */

		$scope.datepicker = {
			format: 'dd/MM/yyyy',
			clear: function() {
				$scope.eventSearch.startDate = '';
				$scope.eventSearch.endDate = '';
			},
			start: {
				minDate: Event.getEventMoment($scope.events[0]).format('YYYY-MM-DD'),
				maxDate: Event.getEventMoment($scope.events[$scope.events.length-1]).format('YYYY-MM-DD'),
				toggle: function(off) {
					$scope.datepicker.end.opened = false;
					if($scope.datepicker.start.opened || off)
						$scope.datepicker.start.opened = false;
					else
						$scope.datepicker.start.opened = true;
				},
				opened: false
			},
			end: {
				maxDate: Event.getEventMoment($scope.events[$scope.events.length-1]).format('YYYY-MM-DD'),
				setMinDate: function() {
					$scope.datepicker.end.minDate = moment($scope.eventSearch.startDate).add('days', 1).format('YYYY-MM-DD');
				},
				toggle: function(off) {
					$scope.datepicker.start.opened = false;
					if($scope.datepicker.end.opened || off)
						$scope.datepicker.end.opened = false;
					else
						$scope.datepicker.end.opened = true;
				},
				opened: false
			}
		};

		//tests
		// $scope.datepicker.start.minDate = '2014-05-15';
		// $scope.datepicker.start.maxDate = '2014-06-23';
		// $scope.datepicker.end.maxDate = '2014-06-23';

		$scope.$watch('eventSearch.startDate', function(date, prevDate) {
			$scope.datepicker.start.toggle(true);
			$scope.datepicker.start.view = moment(date).format('DD/MM');
			if($scope.eventSearch.endDate && date > $scope.eventSearch.endDate) {
				$scope.eventSearch.endDate = '';
			}
			$scope.datepicker.end.setMinDate();
			if(date || prevDate) {
				$state.go('events.filter', _.extend($stateParams, {
					startDate: date
				}));
			}
		});

		$scope.$watch('eventSearch.endDate', function(date, prevDate) {
			$scope.datepicker.end.toggle(true);
			$scope.datepicker.end.view = moment(date).format('DD/MM');
			if(date || prevDate) {
				$state.go('events.filter', _.extend($stateParams, {
					endDate: date
				}));
			}
		});

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
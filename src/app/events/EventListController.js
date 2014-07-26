'use strict';

module.exports = [
	'$q',
	'$interval',
	'$timeout',
	'$state',
	'$stateParams',
	'EventService',
	'$scope',
	function($q, $interval, $timeout, $state, $stateParams, Event, $scope) {

		$scope.service = Event;

		$scope.events = Event.getEvents();

		$scope.spaces = Event.getSpaces();

		$scope.linguagens = Event.getTaxTerms('linguagem');

		var occurrences = Event.getOccurrences();

		// Change state to single event
		$scope.accessEvent = function(e) {
			$state.go('eventsSingle', {eventId: e.id});
		}

		/*
		 * Init search (filter) vals with state params
		 */

		$scope.tag = $state.params.tag;

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
				},
				hasNextPage: function() {
					return this.curPage !== this.pageCount();
				},
				hasPrevPage: function() {
					return this.curPage !== 0;
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
			$scope.eventNav.offset = $scope.eventNav.perPage * $scope.eventNav.curPage;
		}

		$scope.$watch('eventNav.curPage', function(page, prevPage) {
			if(page || prevPage) {
				$state.go('events.filter', _.extend($stateParams, {
					page: page + 1
				}));
			}
		});

		// clear pagination when search changes
		$scope.$watch('eventSearch', function(newVal, oldVal) {
			if(oldVal !== newVal) {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}
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
		$scope.$watch('eventSearch.$', function(text, oldText) {
			if(oldText !== text) {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}
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

		var baseEvents;

		$scope.futureEvents = function(init) {
			// clear navigation
			if(typeof init == 'undefined') {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}
			// get events
			$scope.events = Event.getFutureEvents(null, baseEvents);
			$scope.isFutureEvents = true;

			// update space data
			_.each($scope.spaces, function(space) {
				space.events = angular.copy(_.filter($scope.events, function(e) {
					return _.find(e.occurrences, function(occur) {
						return occur.spaceId == space.id;
					});
				}));
			});
		};

		$scope.tagEvents = function(init) {

			if(typeof init == 'undefined') {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}

			$scope.events = _.filter(Event.getEvents(), function(e) { return e.terms.tag && e.terms.tag.indexOf($state.params.tag) !== -1; });
			baseEvents = $scope.events.slice(0);
			$scope.isFutureEvents = false;

			// update space data
			_.each($scope.spaces, function(space) {
				space.events = angular.copy(_.filter($scope.events, function(e) {
					return _.find(e.occurrences, function(occur) {
						return occur.spaceId == space.id;
					});
				}));
			});

		}

		$scope.allEvents = function(init) {
			// clear navigation
			if(typeof init == 'undefined') {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}
			// get events
			$scope.events = Event.getEvents();
			$scope.isFutureEvents = false;

			// update space data
			_.each($scope.spaces, function(space) {
				space.events = angular.copy(_.filter($scope.events, function(e) {
					return _.find(e.occurrences, function(occur) {
						return occur.spaceId == space.id;
					});
				}));
			});
		};

		// Init events
		var initEvents = function() {
			if($state.params.tag)
				$scope.tagEvents(true);
			else if(!parseInt($state.params.past) && Event.isHappening())
				$scope.futureEvents(true);
			else
				$scope.allEvents(true);
		}
		initEvents();

		$scope.toggleFutureEvents = function() {

			if(!$scope.isFutureEvents) {
				$scope.futureEvents();
				$state.go('events.filter', _.extend($stateParams, {
					past: 0,
				}));
			} else {
				if($state.params.tag) {
					$scope.tagEvents();
				} else {
					$scope.allEvents();
				}
				$state.go('events.filter', _.extend($stateParams, {
					past: 1,
				}));
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
				minDate: occurrences[0].moment.format('YYYY-MM-DD'),
				maxDate: occurrences[occurrences.length-1].moment.format('YYYY-MM-DD'),
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
				maxDate: occurrences[occurrences.length-1].moment.format('YYYY-MM-DD'),
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

			// reset pagination
			if(date !== prevDate) {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}

			if(date) {
				$scope.events = Event.getEventsByDateRange($scope.eventSearch.startDate, $scope.eventSearch.endDate || null, baseEvents);
			} else {
				initEvents();
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

			// reset pagination
			if(date !== prevDate) {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}

			if($scope.eventSearch.startDate) {
				$scope.events = Event.getEventsByDateRange($scope.eventSearch.startDate, $scope.eventSearch.endDate || null);
			} else {
				initEvents();
			}

		});

		$scope.getOccurrences = function(e) {
			var occurrences = e.occurrences;
			if($scope.eventSearch.startDate) {
				occurrences = e.filteredOccurrences;
			} else if($scope.isFutureEvents) {
				occurrences = _.filter(e.occurrences, function(occur) {
					return occur.isFuture;
				});
			} else {
				occurrences = e.occurrences;
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

		/*
		 * Featured event
		 */

		$scope.featuredEvent = function(geocode) {

			var getRandomCloseSpace = function() {

				var orderedSpaces = _.sortBy($scope.spaces, function(s) { return s._distance; });

				orderedSpaces = _.filter(orderedSpaces, function(s) { return s.events.length && Event.getFutureEvents(null, s.events); });

				if(orderedSpaces.length)
					return orderedSpaces[_.random(0, 2)] || orderedSpaces[0];
				
				return false;

			};

			var closestSpace = false;
			var featuredEvent = false;

			if(geocode) {
				var closestSpace = getRandomCloseSpace();
			}

			// geolocation is broken or couldnt find close space
			if(!closestSpace || !closestSpace._distance || closestSpace._distance > 10 * 1000) {

				var occurrences = _.filter(Event.getOccurrences(), function(occur) { return occur.isFuture; });
				var occurrence;
				var label;
				var type;

				if(!occurrences.length) {
					occurrences = Event.getOccurrences();
					occurrence = occurrences[_.random(0, occurrences.length-1)];
					label = 'Destaque';
					type = 'old';
				} else {
					occurrence = occurrences[_.random(0,3)] || occurrences[0];
					label = 'Acontecendo agora';
					type = 'far';
				}

				featuredEvent = {
					type: type,
					label: label,
					event: Event.getOccurrenceEvent(occurrence),
					occurrence: occurrence,
					space: Event.getOccurrenceSpace(occurrence)
				};

			} else {

				var occurrences = _.filter(Event.getOccurrences(), function(occur) {
					return occur.spaceId == closestSpace.id && occur.isFuture;
				});

				var occurrence = occurrences[_.random(0, 3)] || occurrences[0];

				featuredEvent = {
					type: 'near',
					label: 'Agora perto de você',
					event: Event.getOccurrenceEvent(occurrence),
					occurrence: occurrence,
					space: closestSpace
				};

			}

			return featuredEvent;

		};

		$scope.featured = $scope.featuredEvent(false);

		/*
		 * Load space distances and rerender featured event
		 */
		Event.initUserLocation().then(function() {
			_.each($scope.spaces, function(space) {
				var d = Event.getSpaceDistance(space);
				space._distance = d;
				space.kmDistance = Math.round(d/10)/100;
			});
			$scope.featured = $scope.featuredEvent(true);
		});

	}
];
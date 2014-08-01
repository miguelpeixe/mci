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

		// update space data
		_.each($scope.spaces, function(space) {
			space.events = angular.copy(_.filter($scope.events, function(e) {
				return _.find(e.occurrences, function(occur) {
					return occur.spaceId == space.id;
				});
			}));
		});

		$scope.linguagens = Event.getTaxTerms('linguagem');

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

		$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

			if(fromParams.page == toParams.page) {
				$scope.eventNav.curPage = 0;
				$scope.eventNav.offset = 0;
			}

			if(toParams.tag && toParams.space !== fromParams.space) {
				$scope.tag = toParams.tag;
				$scope.events = _.filter(Event.getEvents(), function(e) { return e.terms.tag && e.terms.tag.indexOf($state.params.tag) !== -1; });
			} else {
				$scope.tag = false;
			}

			if(toParams.space && toParams.space !== fromParams.space) {
				$scope.space = _.find(Event.getSpaces(), function(space) { return space.id == toParams.space; });
				$scope.events = _.filter(Event.getEvents(), function(e) {
					e.filteredOccurrences = [];
					_.each(e.occurrences, function(occur) {
						var space = Event.getOccurrenceSpace(occur);
						if(space && space.id == $state.params.space) {
							e.filteredOccurrences.push(occur);
						}
					});
					return e.filteredOccurrences.length;
				});
			} else if(!toParams.space) {
				$scope.space = false;
			}

			if(!parseInt(toParams.past) && Event.isHappening() && !toParams.startDate) {
				$scope.isFutureEvents = true;
			} else {
				$scope.isFutureEvents = false;
			}

			if(!toParams.space && !toParams.tag && (!toParams.past && Event.isHappening())) {
				$scope.events = Event.getEvents();
			}

		});

		$scope.toggleFutureEvents = function() {

			if($scope.isFutureEvents) {
				$state.go('events.filter', _.extend($stateParams, {
					past: 1,
				}));
			} else {
				$state.go('events.filter', _.extend($stateParams, {
					past: 0,
				}));
			}

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

		$scope.spaceNav = nav('filteredSpaces', 6);

		$scope.$watch('spaceSearch', function() {
			$scope.spaceNav.curPage = 0;
			$scope.spaceNav.offset = 0;
		});

		/*
		 * Event nav
		 */

		$scope.eventNav = nav('filteredEvents', 12, '#event-list');

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
				$scope.eventSearch.isFuture ||
				$scope.space ||
				$scope.tag
			);
		};

		// notworking
		$scope.showFromNow = function(event) {
			var limit = 1000 * 60 * 60 * 4; // Four hours in milliseconds
			return event._timestamp <= Event.getToday().unix() + limit;
		};

		/*
		 * Datepicker
		 */

		var occurrences = Event.getOccurrences();
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
		 * Featured event
		 */

		$scope.featuredEvent = function(geocode) {

			var amount = 3;

			var getCloseSpaces = function(amount) {

				var orderedSpaces = _.sortBy($scope.spaces, function(s) { return s._distance; });

				orderedSpaces = _.filter(orderedSpaces, function(s) { return s.events.length && Event.getFutureEvents(null, s.events); });

				if(orderedSpaces.length)
					return orderedSpaces.slice(0, amount);

				return false;

			};

			var closestSpaces = false;
			var occurrences;
			var featured = false;

			if(geocode) {
				var closestSpaces = getCloseSpaces(amount);
			}

			// geolocation is broken or couldnt find close space
			if(!closestSpaces.length || !closestSpaces[0]._distance || closestSpaces[0]._distance > 10 * 1000) {

				occurrences = _.filter(Event.getOccurrences(), function(occur) { return occur.isFuture; });

				var label;
				var type;

				if(!occurrences.length) {
					occurrences = Event.getOccurrences().slice(0, amount);
					label = 'Destaque';
					type = 'old';
				} else {
					occurrences = occurrences.slice(0, amount);
					label = 'Acontecendo agora';
					type = 'far';
				}

				featured = {
					label: label,
					type: type,
					events: []
				};

				_.each(occurrences, function(occur) {
					featured.events.push({
						event: Event.getOccurrenceEvent(occur),
						occurrence: occur,
						space: Event.getOccurrenceSpace(occur)
					});
				});

			} else {

				occurrences = _.filter(Event.getOccurrences(), function(occur) {
					return occur.spaceId == closestSpaces[_.random(0, amount-1)].id && occur.isFuture;
				}).slice(0, amount);

				featured = {
					type: 'near',
					label: 'Agora perto de você',
					events: []
				};

				_.each(occurrences, function(occur) {
					featured.events.push({
						event: Event.getOccurrenceEvent(occur),
						occurrence: occur,
						space: Event.getOccurrenceSpace(occur)
					});
				});

			}

			return featured;

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

		$scope.openFeatured = function(event, featEvent) {
			if(featEvent != $scope.openedFeatured) {

				$scope.featured.image = '';
				if(featEvent.event['@files:avatar']) {
					$scope.featured.image = featEvent.event['@files:avatar'].url;
				}

				if(event) {
					event.stopPropagation();
					event.preventDefault();
				}

				$scope.openedFeatured = featEvent;

				$interval.cancel(featuredInterval);
				featuredInterval = $interval(function() {
					var toOpen = $scope.featured.events[$scope.featured.events.indexOf($scope.openedFeatured)+1] || $scope.featured.events[0];
					$scope.openFeatured(false, toOpen);
				}, 8000);

			}
		};

		var featuredInterval = $interval(function() {
			var toOpen = $scope.featured.events[$scope.featured.events.indexOf($scope.openedFeatured)+1] || $scope.featured.events[0];
			$scope.openFeatured(false, toOpen);
		}, 8000);

		$scope.$watch('featured', function(featured) {
			if(featured && featured.events.length)
				$scope.openFeatured(null, featured.events[0]);
		});

	}
];
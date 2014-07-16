'use strict';

angular.module('mci.events', [
	'ui.router',
	'pickadate'
])
.config([
	'$stateProvider',
	function($stateProvider) {

		$stateProvider
			.state('events', {
				url: '/eventos/',
				controller: 'EventListController',
				templateUrl: '/views/events/list.html'
			})
			.state('events.filter', {
				url: ':startDate/:endDate/:linguagem/:search/:space/:future/:page'
			})
			.state('eventsSingle', {
				url: '/eventos/:eventId/',
				controller: 'EventSingleController',
				templateUrl: '/views/events/single.html'
			});

	}
])
.factory('EventService', require('./EventService'))
.controller('EventListController', require('./EventListController'))
.controller('EventSingleController', require('./EventSingleController'));
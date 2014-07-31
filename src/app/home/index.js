'use strict';

angular.module('mci.home', [
	'mci.news',
	'mci.events'
])
.config([
	'$stateProvider',
	function($stateProvider) {

		$stateProvider
			.state('home', {
				url: '/',
				controller: 'HomeController',
				templateUrl: '/views/pages/home.html',
				resolve: {
					NewsData: [
						'$q',
						'$window',
						'NewsService',
						function($q, $window, News) {

							if($window.mci.config.wpUrl) {
								return News.get(4);
							} else {
								return false;
							}

						}
					]
				}
			});

	}
])
.controller('HomeController', [
	'NewsData',
	'EventService',
	'$scope',
	function(NewsData, Event, $scope) {

		if(NewsData) {
			$scope.news = {
				first: NewsData.data[0],
				second: NewsData.data[1]
			};
		}

		$scope.homeEvents = Event.getFutureEvents(5);

		$scope.allEvents = Event.getEvents();
		$scope.allSpaces = Event.getSpaces();

	}
]);
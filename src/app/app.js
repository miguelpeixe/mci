'use strict';

/*
 * Modules
 */

require('./events');

/*
 * App
 */

angular.module('mci', [
	'ui.router',
	'mci.events'
])
.config([
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider',
	'$httpProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: '/views/pages/home.html'
			});

		/*
		 * Trailing slash rule
		 */
		$urlRouterProvider.rule(function($injector, $location) {
			var path = $location.path(),
				search = $location.search(),
				params;

			// check to see if the path already ends in '/'
			if (path[path.length - 1] === '/') {
				return;
			}

			// If there was no search string / query params, return with a `/`
			if (Object.keys(search).length === 0) {
				return path + '/';
			}

			// Otherwise build the search string and return a `/?` prefix
			params = [];
			angular.forEach(search, function(v, k){
				params.push(k + '=' + v);
			});
			
			return path + '/?' + params.join('&');
		});

	}
]);

$(document).ready(function() {
	window.events = [];
	$.get('/data/events.json', function(events) {
		window.events = events;
		$.get('/data/spaces.json', function(spaces) {
			window.spaces = spaces;
			angular.bootstrap(document, ['mci']);
		}, 'json');
	}, 'json');
});
'use strict';

/*
 * Modules
 */

require('./events');
require('./social');

/*
 * App
 */

angular.module('mci', [
	'ui.router',
	'mci.events',
	'mci.social'
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
			})
			.state('about', {
				url: '/sobre/',
				templateUrl: '/views/pages/about.html'
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
])
.filter('offset', function() {
	return function(input, start) {
		start = parseInt(start, 10);
		return input.slice(start);
	};
})

.directive('fromnow', [
	'$interval',
	function($interval) {
		return {
			scope: {
				date: '=date'
			},
			template: '{{fromNow}}',
			link: function(scope, element, attrs) {

				var today = moment('2014-05-18 10:10', 'YYYY-MM-DD HH:mm');

				var date = moment(scope.date*1000);

				scope.fromNow = date.from(today);
				var interval = $interval(function() {
					scope.fromNow = date.from(today);
				}, 1000*60);

				scope.$watch('date', function() {
					date = moment(scope.date*1000);
					scope.fromNow = date.from(today);
					$interval.cancel(interval);
					interval = $interval(function() {
						scope.fromNow = date.from(today);
					}, 1000*60);
				});
			}
		}
	}
])

.controller('NavCtrl', [
	'$scope',
	'$sce',
	function($scope, $sce) {

		$scope.nav = [
			{
				title: 'Página inicial',
				href: '/',
				icon: $sce.trustAsHtml('&#8962;')
			},
			{
				title: 'Agenda',
				href: '/agenda/',
				icon: $sce.trustAsHtml('&#128197;')
			},
			{
				title: 'Notícias',
				href: '/',
				icon: $sce.trustAsHtml('&#128196;')
			},
			{
				title: 'Na rede',
				href: '/na-rede/',
				icon: $sce.trustAsHtml('&#127748;')
			},
			{
				title: 'Imprensa',
				href: '/',
				icon: $sce.trustAsHtml('&#127908;')
			},
			{
				title: 'Sobre',
				href: '/sobre/',
				icon: $sce.trustAsHtml('&#8505;')
			}
		];

		$scope.updateHover = function(str) {

			$scope.currentHover = str;

		};

		$scope.currentHover = '';

	}
]);

$(document).ready(function() {
	$.get('/api/data', function(data) {
		window.options = data.options;
		window.events = data.events;
		window.spaces = data.spaces;
		angular.bootstrap(document, ['mci']);
	}, 'json');
});
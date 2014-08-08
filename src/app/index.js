'use strict';

/*
 * Modules
 */

require('./home');
require('./events');
require('./news');
require('./social');

/*
 * App
 */

angular.module('mci', [
	'ui.router',
	'mci.home',
	'mci.events',
	'mci.news',
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

/* 
 * Track history and push navigation to Google Analytics
 */
.run([
	'$rootScope',
	'$location',
	'$window',
	function($rootScope, $location, $window) {

		/*
		 * Store nav history
		 */
		$window.mci.history = [];
		$rootScope.$on('$stateChangeSuccess', function() {

			if($window._gaq) {
				$window._gaq.push(['_trackPageview', $location.path()]);
			}
			$window.mci.history.push($window.location.pathname);

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

				var today = moment();

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
				href: '/noticias/',
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
])

/*
 * Loading module
 */

.config([
	'$httpProvider',
	function($httpProvider) {
		$httpProvider.interceptors.push('loadingStatusInterceptor');
	}
])

.service('LoadingService', [
	function() {

		var loads = [];

		return {
			get: function() {
				return loads;
			},
			add: function(text, id) {
				if(typeof id == 'undefined')
					id = Math.random();

				var load = {
					_id: id,
					msg: text
				};

				loads.push(load);
				loads = loads; // trigger digest?
				return load._id;
			},
			remove: function(id) {
				loads = loads.filter(function(load) { return load._id !== id; });
				loads = loads;
				return loads;
			}
		}

	}
])

.directive('loadingStatusMessage', [
	'LoadingService',
	function(service) {
		return {
			link: function($scope, $element, attrs) {
				$scope.$watch(function() {
					return service.get();
				}, function(loads) {
					$scope.loads = loads;
				});
			},
			template: '<div class="loading-message"><span ng-repeat="load in loads" ng-show="load.msg">{{load.msg}}<br/></span></div>'
		};
	}
])

.factory('loadingStatusInterceptor', [
	'$q',
	'$rootScope',
	'$timeout',
	'LoadingService',
	function($q, $rootScope, $timeout, service) {
		return {
			request: function(config) {

				if(config.loadingMessage)
					config.loadingId = service.add(config.loadingMessage);

				return config || $q.when(config);
			},
			response: function(response) {

				if(response.config.loadingId)
					service.remove(response.config.loadingId);

				return response || $q.when(response);
			},
			responseError: function(rejection) {


				if(rejection.config.loadingId)
					service.remove(rejection.config.loadingId);

				return $q.reject(rejection);
			}
		};
	}
]);

$(document).ready(function() {
	$('#loading').addClass('active');
	$.get('/api/data', function(data) {
		window.mci = data;
		$('#loading').removeClass('active');
		angular.bootstrap(document, ['mci']);
	}, 'json');
});
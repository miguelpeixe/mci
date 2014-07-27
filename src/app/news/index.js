'use strict';

angular.module('mci.news', [
	'ui.router',
	'infinite-scroll',
	'wu.masonry',
	'ngDialog'
])
.config([
	'$stateProvider',
	function($stateProvider) {

		$stateProvider
			.state('news', {
				url: '/noticias/',
				controller: 'NewsController',
				templateUrl: '/views/news/index.html',
				resolve: {
					'NewsData': [
						'NewsService',
						function(News) {
							return News.get(20);
						}
					]
				}
			});

	}
])
.factory('NewsService', require('./NewsService'))
.controller('NewsController', require('./NewsController'));
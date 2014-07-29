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
							return News.get(10);
						}
					]
				}
			}).
			state('newsSingle', {
				url: '/noticias/:postId/',
				controller: 'NewsSingleController',
				templateUrl: '/views/news/single.html',
				resolve: {
					'PostData': [
						'$stateParams',
						'NewsService',
						function($stateParams, News) {
							return News.getPost($stateParams.postId);
						}
					]
				}
			});

	}
])
.factory('NewsService', require('./NewsService'))
.controller('NewsController', require('./NewsController'))
.controller('NewsSingleController', require('./NewsSingleController'));
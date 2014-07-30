'use strict';

angular.module('mci.news', [
	'ui.router'
])
.config([
	'$stateProvider',
	function($stateProvider) {

		var perPage = 10;

		$stateProvider
			.state('news', {
				url: '/noticias/',
				controller: 'NewsController',
				templateUrl: '/views/news/index.html',
				resolve: {
					'NewsData': [
						'NewsService',
						function(News) {
							return News.get(perPage);
						}
					]
				}
			})
			.state('news.paging', {
				url: 'pagina/:page/',
				resolve: {
					'NewsData': [
						'$stateParams',
						'NewsService',
						function($stateParams, News) {
							return News.get(perPage, $stateParams.page);
						}
					]
				},
				controller: [
					'NewsData',
					'$scope',
					function(NewsData, $scope) {
						$scope.$parent.query = NewsData;
					}
				]
			})
			.state('news.search', {
				url: 'busca/:text/',
				resolve: {
					'NewsData': [
						'$stateParams',
						'NewsService',
						function($stateParams, News) {
							return News.search($stateParams.text, perPage);
						}
					]
				},
				controller: [
					'$stateParams',
					'NewsData',
					'$scope',
					function($stateParams, NewsData, $scope) {
						$scope.$parent.search = $stateParams.text;
						$scope.$parent.query = NewsData;
						$scope.$watch('query', function(query) {
							$scope.$parent.query = query;
						});
					}
				]
			})
			.state('news.search.paging', {
				url: 'pagina/:page/',
				resolve: {
					'NewsData': [
						'$stateParams',
						'NewsService',
						function($stateParams, News) {
							return News.search($stateParams.text, perPage, $stateParams.page);
						}
					]
				},
				controller: [
					'NewsData',
					'$scope',
					function(NewsData, $scope) {
						$scope.$parent.query = NewsData;
					}
				]
			})
			.state('newsSingle', {
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
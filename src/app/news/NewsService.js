'use strict';

module.exports = [
	'$rootScope',
	'$http',
	'$q',
	'$window',
	function($rootScope, $http, $q, $window) {

		 var url = $window.mci.config.wpUrl + '/wp-json/posts';

		var load = function(perPage, page, cb) {

			perPage = perPage || 10;
			page = page || 1;
		 	var query = {
				page: page,
				filter: {
					'posts_per_page': perPage
				}
			};

			/*
			 * Using jQuery ajax because angular jsonp callback contains illegal characters for WP API
			 */
			$.ajax({
				url: url,
				data: query,
				dataType: 'jsonp',
				jsonp: '_jsonp',
				success: function(data, text, xhr) {

					/*
					 * Since JSONP doesnt handle response headers, a server-side hack
					 * The pagination data is given as header (thats why we need it)
					 */
					$.post('/api/reqHeader', {
						url: url,
						filter: query.filter
					}, function(headers) {
						$rootScope.$apply(function() {
							cb(data, headers['x-wp-total'], headers['x-wp-totalpages']);
						});
					}, 'json');

				}
			});

			// $http({
			// 	method: 'JSONP',
			// 	url: $window.mci.config.wpUrl + '/wp-json/posts',
			// 	params: {
			// 		posts_per_page: perPage,
			// 		_jsonp: 'JSON_CALLBACK'
			// 	}
			// })
			// .success(function(data, status, headers, config) {
			// 	cb(data, status, headers, config);
			// })
			// .error(function(data, status, headers, config) {
			// 	cb(data, status, headers, config);
			// });

		};

		return {
			get: function(perPage) {

				var deferred = $q.defer();
				var totalPages;
				var currentPage;

				load(perPage, 1, function(data, total, pageAmount) {

					totalPages = pageAmount;
					currentPage = 1;

					deferred.resolve({
						data: data,
						totalPages: function() {
							return parseInt(totalPages);
						},
						currentPage: function() {
							return currentPage;
						},
						nextPage: function() {
							var deferred = $q.defer();
							if(currentPage == totalPages) {
								deferred.resolve(false);
							} else {
								load(perPage, currentPage+1, function(data) {
									currentPage++;
									deferred.resolve(data);
								});
							}
							return deferred.promise;
						},
						prevPage: function() {
							var deferred = $q.defer();
							if(currentPage == 1) {
								deferred.resolve(false);
							} else {
								load(perPage, currentPage-1, function(data) {
									currentPage--;
									deferred.resolve(data);
								});
							}
							return deferred.promise;
						}
					});

				});

				return deferred.promise;

			},
			getPost: function(postId) {

				var deferred = $q.defer();

				$.ajax({
					url: url + '/' + postId,
					dataType: 'jsonp',
					jsonp: '_jsonp',
					success: function(data, text, xhr) {

						console.log(data);

						deferred.resolve(data);

					}
				});

				return deferred.promise;

			}
		}

	}
]
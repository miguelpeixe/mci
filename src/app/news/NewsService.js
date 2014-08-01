'use strict';

module.exports = [
	'$rootScope',
	'$http',
	'$q',
	'$window',
	function($rootScope, $http, $q, $window) {

		var url = $window.mci.config.wpUrl + '/wp-json/posts';

		var load = function(query, cb) {

			query = query || { page: 1, filter: { posts_per_page: 10 }};

			/*
			 * Using jQuery ajax because angular jsonp callback contains illegal characters for WP API
			 */
			$.ajax({
				url: url,
				data: query,
				dataType: 'jsonp',
				jsonp: '_jsonp',
				cache: true,
				success: function(data, text, xhr) {
					/*
					 * Since JSONP doesnt handle response headers, a server-side hack
					 * The pagination data is given as header (thats why we need it)
					 */
					$.post('/api/reqHeader', _.extend(query, { url: url }), function(headers) {
						// We left angular scope, need to call digest
						$rootScope.$apply(function() {
							cb(data, headers['x-wp-total'], headers['x-wp-totalpages']);
						});
					}, 'json');
				}
			});

		};

		var query = function(query) {

			var deferred = $q.defer();
			var totalPosts;
			var totalPages;
			var currentPage;

			load(query, function(data, total, pageAmount) {

				totalPosts = total;
				totalPages = pageAmount;
				currentPage = query.page;

				deferred.resolve({
					data: data,
					totalPosts: function() {
						return parseInt(totalPosts);
					},
					totalPages: function() {
						return parseInt(totalPages);
					},
					currentPage: function() {
						return parseInt(currentPage);
					},
					nextPage: function() {
						var deferred = $q.defer();
						if(currentPage == totalPages) {
							deferred.resolve(false);
						} else {
							load(_.extend(query, { page: currentPage+1 }), function(data) {
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
							load(_.extend(query, { page: currentPage-1 }), function(data) {
								currentPage--;
								deferred.resolve(data);
							});
						}
						return deferred.promise;
					}
				});

			});

			return deferred.promise;

		};

		var lastPerPage;

		return {
			query: query,
			get: function(perPage, page) {
				page = page || 1;
				perPage = perPage || lastPerPage;
				lastPerPage = perPage;
				return query({
					page: page,
					filter: {
						posts_per_page: perPage
					}
				});
			},
			search: function(text, perPage, page) {
				page = page || 1;
				perPage = perPage || lastPerPage;
				return query({
					page: page,
					filter: {
						s: text,
						posts_per_page: perPage
					}
				});
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
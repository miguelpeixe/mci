'use strict';

module.exports = [
	'$http',
	'$q',
	function($http, $q) {

		var load = function(perPage, page, cb) {

			page = page || 1;

			$http({
				method: 'GET',
				url: '/api/social',
				params: {
					page: page,
					perPage: perPage
				}
			}).success(function(data) {
				cb(data);
			});

		}

		return {

			get: function(perPage) {

				var deferred = $q.defer();
				var totalPages;
				var currentPage;

				load(perPage, 1, function(data) {

					currentPage = data.pagination.currentPage;
					totalPages = data.pagination.totalPages;

					deferred.resolve({
						data: data.data,
						nextPage: function() {
							var deferred = $q.defer();
							load(perPage, currentPage+1, function(data) {
								currentPage = data.pagination.currentPage;
								deferred.resolve(data.data);
							});
							return deferred.promise;
						}
					});

				});

				return deferred.promise;

			}

		}

	}
];
'use strict';

module.exports = [
	'$http',
	'$q',
	'$window',
	function($http, $q, $window) {

		var load = function(perPage, page, cb) {

			perPage = perPage || 10;

			var c = $window.angular.callbacks.counter.toString(36);

			$window['angularcallbacks_' + c] = function (data) {
				$window.angular.callbacks['_' + c](data);
				delete $window['angularcallbacks_' + c];
			};

			$http({
				method: 'JSONP',
				url: $window.mci.config.wpUrl + '/wp-json/posts',
				params: {
					posts_per_page: perPage,
					_jsonp: 'JSON_CALLBACK'
				}
			})
			.success(function(data, status, headers, config) {
				cb(data, status, headers, config);
			})
			.error(function(data, status, headers, config) {
				cb(data, status, headers, config);
			});

		};

		return {
			get: function(perPage) {

				var deferred = $q.defer();

				load(perPage, 1, function(data, status, headers, config) {

					console.log(data);
					deferred.resolve(data);

				});

				return deferred.promise;

			}
		}

	}
]
'use strict';

module.exports = [
	'NewsData',
	'$scope',
	function(NewsData, $scope) {

		$scope.items = NewsData;

	}
]
'use strict';

module.exports = [
	'SocialData',
	'$scope',
	function(SocialData, $scope) {

		$scope.items = SocialData.data;

		$scope.nextPage = SocialData.nextPage;

		console.log($scope.items.length);

	}
]
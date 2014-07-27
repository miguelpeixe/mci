'use strict';

module.exports = [
	'SocialData',
	'$scope',
	function(SocialData, $scope) {

		$scope.items = SocialData.data;

		$scope.nextPage = function() {
			SocialData.nextPage().then(function(data) {
				if(data) {
					if(data.pagination.currentPage == data.pagination.totalPages)
						$scope.lastPage = true;
					$scope.items = $scope.items.concat(data.data);
				}
			});
		};

	}
]
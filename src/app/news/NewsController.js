'use strict';

module.exports = [
	'NewsData',
	'$scope',
	'$sce',
	function(NewsData, $scope, $sce) {

		$scope.items = NewsData.data;

		var updatePaging = function() {
			$scope.currentPage = NewsData.currentPage();
			$scope.firstPage = $scope.currentPage == 1;
			$scope.lastPage = NewsData.totalPages() == $scope.currentPage;
		}

		$scope.getExcerpt = function(item) {
			return $sce.trustAsHtml(item.excerpt);
		};

		$scope.getDate = function(item) {
			return moment(item.date).format('LLLL');
		}

		console.log($scope.items);

		updatePaging();

		$scope.nextPage = function() {
			NewsData.nextPage().then(function(data) {
				if(data) {
					$scope.items = data;
				}
				updatePaging();
			});
		};
		$scope.prevPage = function() {
			NewsData.prevPage().then(function(data) {
				if(data) {
					$scope.items = data;
				}
				updatePaging();
			});
		};

	}
]
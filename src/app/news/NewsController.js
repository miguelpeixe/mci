'use strict';

module.exports = [
	'$sce',
	'$state',
	'$stateParams',
	'NewsData',
	'NewsService',
	'$scope',
	function($sce, $state, $stateParams, NewsData, News, $scope) {

		$scope.query = NewsData;

		$scope.$on('$stateChangeSuccess', function(event, toState) {
			if(toState.name == 'news')
				$scope.query = NewsData;
		});

		$scope.$watch('query', function(query) {
			$scope.items = query.data;
			$scope.currentPage = query.currentPage();
			$scope.firstPage = $scope.currentPage == 1;
			$scope.lastPage = query.totalPages() == $scope.currentPage;
		});

		$scope.getExcerpt = function(item) {
			return $sce.trustAsHtml(item.excerpt);
		};

		$scope.getDate = function(item) {
			return moment(item.date).format('LLLL');
		};

		$scope.$watch('search', _.debounce(function(text, prevText) {

			if(text) {

				$state.go('news.search', { text: text });

			} else if(prevText) {

				$state.go('news');

			}

		}, 400));

		$scope.nextPage = function() {
			var state = 'news';
			if($state.current.name.indexOf('search') != -1)
				state = 'news.search';
			$state.go(state + '.paging', { page: $scope.query.currentPage() + 1 });
		};
		$scope.prevPage = function() {
			var state = 'news';
			if($state.current.name.indexOf('search') != -1)
				state = 'news.search';
			$state.go(state + '.paging', { page: $scope.query.currentPage() - 1 });
		};

	}
]
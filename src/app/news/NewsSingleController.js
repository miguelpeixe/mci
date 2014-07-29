'use strict';

module.exports = [
	'PostData',
	'$scope',
	'$sce',
	function(PostData, $scope, $sce) {

		$scope.post = PostData;

		$scope.getContent = function(post) {

			return $sce.trustAsHtml(post.content);

		};

	}
]
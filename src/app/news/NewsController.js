'use strict';

module.exports = [
	'$sce',
	'$scope',
	function($sce, $scope) {

		$scope.getTitle = function(post) {
			return $sce.trustAsHtml(post.title);
		}

		$scope.getExcerpt = function(post) {
			return $sce.trustAsHtml(post.excerpt);
		};

		$scope.getDate = function(post) {
			return moment(post.date).calendar();
		};

		$scope.getFeaturedImage = function(post) {
			if(post.featured_image) {
				if(post.featured_image.attachment_meta.sizes.large)
					return post.featured_image.attachment_meta.sizes.large.url;
				else
					return post.featured_image.source;
			}
			return false;
		}

	}
];
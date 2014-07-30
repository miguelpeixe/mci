'use strict';

module.exports = [
	'$sce',
	'SocialData',
	'$scope',
	function($sce, SocialData, $scope) {

		$scope.items = SocialData.data;

		console.log($scope.items);

		$scope.getThumb = function(item) {

			if(item.media_provider == 'youtube') {
				return item.thumb;
			}

			return item.content;

		};

		$scope.getMediaIcon = function(item) {

			var icon;

			switch(item.media_provider) {
				case 'youtube':
					icon = '&#62220;';
					break;
				case 'instagram':
					icon = '&#62253;';
					break;
				case 'flickr':
					icon = '&#62211;';
					break;
			}

			return $sce.trustAsHtml(icon);

		};

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
'use strict';

module.exports = [
	'$stateParams',
	'$window',
	'EventService',
	'$scope',
	function($stateParams, $window, Event, $scope) {

		$scope.getDescription = function(e) {
			var description = '';
			if($scope.event.longDescription) {
				description = $scope.event.longDescription;
			} else if($scope.event.shortDescription) {
				description = $scope.event.shortDescription;
			}
			return description;
		}

		if($stateParams.eventId) {
			Event.getEvent($stateParams.eventId).then(function(e) {
				$scope.event = e;

				console.log(e);

				$scope.description = $scope.getDescription(e);

			});
		}

	}
];
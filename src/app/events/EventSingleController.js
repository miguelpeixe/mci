'use strict';

module.exports = [
	'$stateParams',
	'$window',
	'EventService',
	'$scope',
	function($stateParams, $window, Event, $scope) {

		if($stateParams.eventId) {
			Event.getEvent($stateParams.eventId).then(function(e) {
				$scope.event = e;

				console.log(e);

				if($scope.event.longDescription) {
					$scope.description = $scope.event.longDescription;
				} else if($scope.event.shortDescription) {
					$scope.description = $scope.event.shortDescription;
				}

			});
		}

	}
];
'use strict';

module.exports = [
	'ngDialog',
	'leafletData',
	'EventService',
	'$scope',
	function(ngDialog, leafletData, Event, $scope) {

		$scope.openMap = function(event, occur) {

			event.preventDefault();
			event.stopPropagation();

			var map;
			leafletData.getMap().then(function(m) {
				map = m;
				$scope.$watch('markers', function(markers) {
					var bounds = L.latLngBounds(markers);
					m.fitBounds(bounds, { reset: true });
				}, true);
			});
			$scope.space = Event.getOccurrenceSpace(occur);

			$scope.markers = [
				[
					parseFloat($scope.space.location.latitude),
					parseFloat($scope.space.location.longitude)
				]
			];

			$scope.map = {
				defaults: {
					tileLayer: 'http://{s}.sm.mapstack.stamen.com/($f7f7f7[@p],(buildings,$ec008b[hsl-color]),parks,mapbox-water,(streets-and-labels,$38a2a2[hsl-color]))/{z}/{x}/{y}.png',
					maxZoom: 16
				},
				center: {
					lat: $scope.markers[0][0],
					lng: $scope.markers[0][1],
					zoom: 15
				},
				markers: {
					nextOccurrenceMarker: {
						lat: $scope.markers[0][0],
						lng: $scope.markers[0][1],
						message: $scope.space.name
					}
				}
			};

			ngDialog.open({
				template: '/views/events/map.html',
				scope: $scope
			});

		};

		$scope.locateUser = function() {
			Event.initUserLocation().then(function(coords) {
				if(coords) {
					var marker = [
						coords.latitude,
						coords.longitude
					];
					$scope.markers.push(marker);
					$scope.map.markers.userLocation = {
						lat: marker[0],
						lng: marker[1],
						message: 'Sua localização'
					};
				}
			});
		};

	}
];
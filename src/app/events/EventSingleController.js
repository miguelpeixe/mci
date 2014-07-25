'use strict';

module.exports = [
	'$stateParams',
	'$window',
	'EventService',
	'EventData',
	'leafletData',
	'$scope',
	function($stateParams, $window, Event, EventData, leafletData, $scope) {

		$scope.service = Event;

		$scope.getDescription = function(e) {
			var description = '';
			if($scope.event.longDescription) {
				description = $scope.event.longDescription;
			} else if($scope.event.shortDescription) {
				description = $scope.event.shortDescription;
			}
			return description;
		};

		$scope.getFeaturedOccurrence = function(e) {

			var futureOccurrence = _.find(e.occurrences, function(occur) { return occur.isFuture; });

			if(futureOccurrence)
				return futureOccurrence;
			else if(e.occurrences.length == 1)
				return e.occurrences[0];

			return false;
		};

		$scope.event = EventData;
		$scope.description = $scope.getDescription($scope.event);

		console.log($scope.event);

		$scope.featOccur = $scope.getFeaturedOccurrence($scope.event);

		if($scope.featOccur)
			$scope.featOccur.space = Event.getOccurrenceSpace($scope.featOccur);

		_.each($scope.event.occurrences, function(occur) {
			occur.space = Event.getOccurrenceSpace(occur);
		});

		var map;
		leafletData.getMap().then(function(m) {
			map = m;
			$scope.$watch('markers', function(markers) {
				var bounds = L.latLngBounds(markers);
				m.fitBounds(bounds, { reset: true });
			}, true);
		});

		$scope.markers = [
			[
				parseFloat($scope.featOccur.space.location.latitude),
				parseFloat($scope.featOccur.space.location.longitude)
			]
		];

		// Map settings
		$scope.map = {
			defaults: {
				tileLayer: 'http://{s}.sm.mapstack.stamen.com/($f7f7f7[@p],(buildings,$ec008b[hsl-color]),parks,mapbox-water,(streets-and-labels,$38a2a2[hsl-color]))/{z}/{x}/{y}.png',
				scrollWheelZoom: false,
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
					message: $scope.featOccur.space.name
				}
			},
			open: false,
			toggleLabel: 'Expandir mapa',
			toggle: function() {
				if(this.open) {
					this.toggleLabel = 'Expandir mapa';
					this.open = false;
				} else {
					this.toggleLabel = 'Recolher mapa';
					this.open = true;
				}
				setTimeout(function() {
					map.invalidateSize(true);
				}, 200);
			}
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
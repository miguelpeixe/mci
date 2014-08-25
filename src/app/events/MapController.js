'use strict';

module.exports = [
	'ngDialog',
	'leafletData',
	'EventService',
	'$scope',
	function(ngDialog, leafletData, Event, $scope) {

		$scope.initData = function(space) {

			$scope.routeTo = space.location.latitude + ',' + space.location.longitude;

		}

		$scope.initMap = function(occur, options) {

			options = options || {};

			if(!occur.spaceId) {
				$scope.space = occur;
			} else {
				$scope.space = Event.getOccurrenceSpace(occur);
			}

			$scope.initData($scope.space);

			$scope.markers = [
				[
					parseFloat($scope.space.location.latitude),
					parseFloat($scope.space.location.longitude)
				]
			];

			$scope.map = _.extend({
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
			}, options);

		}

		$scope.openDialog = function(event, occur) {

			event.preventDefault();
			event.stopPropagation();

			$scope.initMap(occur);

			if(isMobile()) {

				window.location = 'https://www.google.com/maps/dir//' + $scope.routeTo + '/';

			} else {

				ngDialog.open({
					template: '/views/events/map.html',
					scope: $scope
				});

			}

		};

		$scope.locateUser = function(mapId) {
			Event.initUserLocation().then(function(coords) {
				$scope.routeFrom = coords.latitude + ',' + coords.longitude;
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
					leafletData.getMap(mapId).then(function(m) {
						var bounds = L.latLngBounds($scope.markers);
						m.fitBounds(bounds, { reset: true });
					});
				}
			});
		};

	}
];
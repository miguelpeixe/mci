'use strict';

module.exports = [
	'$state',
	'$stateParams',
	'EventService',
	'EventData',
	'leafletData',
	'$scope',
	function($state, $stateParams, Event, EventData, leafletData, $scope) {

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

		$scope.featOccur = $scope.getFeaturedOccurrence($scope.event);

		if($scope.featOccur)
			$scope.featOccur.space = Event.getOccurrenceSpace($scope.featOccur);

		_.each($scope.event.occurrences, function(occur) {
			occur.space = Event.getOccurrenceSpace(occur);
		});

		$scope.accessTag = function(tag) {
			$state.go('events.filter', {tag: tag}, {inherit: false});
		}

		$scope.mapOptions = {
			defaults: {
				tileLayer: 'http://{s}.sm.mapstack.stamen.com/($f7f7f7[@p],(buildings,$ec008b[hsl-color]),parks,mapbox-water,(streets-and-labels,$38a2a2[hsl-color]))/{z}/{x}/{y}.png',
				maxZoom: 16,
				scrollWheelZoom: false
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
					leafletData.getMap('main-map').then(function(map) {
						map.invalidateSize(true);
					});
				}, 200);
			}
		};

	}
];
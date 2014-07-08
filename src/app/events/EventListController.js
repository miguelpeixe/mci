'use strict';

module.exports = [
	'$scope',
	'EventService',
	function($scope, Event) {

		$scope.events = Event.getEvents();

	}
];
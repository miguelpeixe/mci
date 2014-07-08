'use strict';

module.exports = [
	'$http',
	function($http) {

		var events = $http({method: 'GET', url: '/data/events.json'});

		return {
			getEvents = function() {
				return events;
			}
		}

	}
];
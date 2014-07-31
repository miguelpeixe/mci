window._ = require('underscore');
window.L = require('leaflet');

require('angular');
require('angular-i18n/angular-locale_pt-br');
require('ui-router');
require('angular-pickadate/src/angular-pickadate');
require('angular-leaflet/dist/angular-leaflet-directive');
require('angular-masonry/angular-masonry');
require('angular-dialog/js/ngDialog');
require('angular-infiniteScroll/build/ng-infinite-scroll');

window.moment = require('moment');
require('moment/lang/pt-br');
moment.lang('pt-br');
moment.lang('pt-br', {
	calendar : {
		sameDay: '[hoje às] LT',
		nextDay: '[amanhã às] LT',
		nextWeek: 'dddd [às] LT',
		lastDay: '[ontem às] LT',
		lastWeek: function () {
			return (this.day() === 0 || this.day() === 6) ?
				'[último] dddd [às] LT' : // Saturday + Sunday
				'[última] dddd [às] LT'; // Monday - Friday
		},
		sameElse: 'L [às] LT'
	},
})
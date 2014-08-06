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
require('moment/locale/pt-br');
moment.locale('pt-br');
moment.locale('pt-br', {
	calendar : {
		sameDay: '[hoje às] LT',
		nextDay: '[amanhã às] LT',
		nextWeek: 'dddd [às] LT',
		lastDay: '[ontem às] LT',
		lastWeek: 'DD/MM [às] LT',
		sameElse: 'DD/MM [às] LT'
	},
})
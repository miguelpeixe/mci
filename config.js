'use strict';

require('dotenv').load();

module.exports = {
	apiUrl: process.env.MCI_API_URL || 'http://spcultura.prefeitura.sp.gov.br/api',
	projectId: process.env.MCI_PROJECT_ID || 4
}
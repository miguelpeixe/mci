'use strict';

require('dotenv').load();

module.exports = {
	apiUrl: process.env.MCI_API_URL || 'http://mapasculturais.hacklab.com.br/api',
	projectId: process.env.MCI_PROJECT_ID || 4
}
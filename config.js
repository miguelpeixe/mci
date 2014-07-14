'use strict';

require('dotenv').load();

module.exports = {
	apiUrl: process.env.MCI_API_URL,
	projectId: process.env.MCI_PROJECT_ID
}
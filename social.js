#!/usr/bin/env node

var fs = require('fs'),
	request = require('request'),
	async = require('async'),
	_ = require('underscore'),
	moment = require('moment'),
	config = require('./config');

module.exports = function(cb) {

	if(!config.hashtag)
		return false;

	var storeDir = 'dist/data';

	var instagram = function() {

		var data = [];

		var req = {
			url: 'https://api.instagram.com/v1/tags/' + config.hashtag + '/media/recent',
			qs: {
				count: 100,
				client_id: config.socialApiKeys.instagram
			}
		};

		var get = function(cb) {

			if(!config.socialApiKeys.instagram)
				return [];

			request(req, function(err, res, body) {

				body = JSON.parse(body);

				var d = [];

				_.each(body.data, function(item) {

					d.push({
						'media_provider': 'instagram',
						'media_type': 'image',
						'content': item['images']['standard_resolution']['url'],
						'thumb': item['images']['thumbnail']['url'],
						'author': item['user']['username'],
						'width': item['images']['standard_resolution']['width'],
						'height': item['images']['standard_resolution']['height'],
						'original_url': item['link'],
						'date_posted': moment(parseFloat(item['created_time'])*1000).unix()
					});

				});

				data = data.concat(d);

				if(body.pagination.next_max_tag_id) {
					req.qs.max_tag_id = body.pagination.next_max_tag_id;
					get(cb);
				} else {
					cb(null, data);
				}

			});
		};

		return {
			get: get
		};

	}

	var flickr = function() {

		var data = [];

		var req = {
			url: 'https://api.flickr.com/services/rest/',
			qs: {
				method: 'flickr.photos.search',
				api_key: config.socialApiKeys.flickr,
				text: config.hashtag,
				per_page: 500,
				format: 'json',
				nojsoncallback: 1,
				extras: 'owner_name,date_upload,url_t,url_l'
			}
		};

		var get = function(cb) {

			if(!config.socialApiKeys.flickr)
				return [];

			request(req, function(err, res, body) {

				body = JSON.parse(body);

				var d = [];

				_.each(body.photos.photo, function(item) {

					if(item.url_l) {

						d.push({
							'media_provider': 'flickr',
							'media_type': 'image',
							'content': item['url_l'],
							'thumb': item['url_t'],
							'author': item['owner_name'],
							'width': item['width_l'],
							'height': item['height_l'],
							'original_url': 'http://www.flickr.com/photos/' + item['owner'] + '/' + item['id'],
							'date_posted': moment(parseInt(item['dateupload']) * 1000).unix()
						});

					}

				});

				data = data.concat(d);

				cb(null, data);

			});
		};

		return {
			get: get
		};

	};

	var youtube = function() {

		var data = [];

		var req = {
			url: 'http://gdata.youtube.com/feeds/api/videos/-/' + config.hashtag,
			qs: {
				alt: 'json'
			}
		};

		var get = function(cb) {

			request(req, function(err, res, body) {

				body = JSON.parse(body);

				var d = [];

				_.each(body.feed.entry, function(item) {

					data.push({
						'media_provider': 'youtube',
						'media_type': 'video',
						'content': item['media$group']['media$content'][0]['url'],
						'thumb': item['media$group']['media$thumbnail'][0]['url'],
						'author': item['author'][0]['name']['$t'],
						'width': item['media$group']['media$thumbnail'][0]['width'],
						'height': item['media$group']['media$thumbnail'][0]['height'],
						'original_url': item['link'][0]['href'],
						'date_posted': moment(item['updated']['$t']).unix()
					});

				});

				data = data.concat(d);

				cb(null, data);

			});
		};

		return {
			get: get
		};

	};

	async.parallel([
		instagram().get,
		flickr().get,
		youtube().get
	], function(err, results) {
		
		var data = _.flatten(results);

		data = _.sortBy(data, function(item) { return item.date_posted; });

		fs.writeFile(storeDir + '/social.json', JSON.stringify(data), function(err) {
			if(err) {
				console.log(err);
			} else {
				if(typeof cb == 'function')
					cb(data);
			}
		});

	});

};

if(!module.parent) module.exports();
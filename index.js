/**
 * FaceNode
 * Ricardo Bin <ricardohbin@gmail.com>
 */

var https = require('https');

module.exports = function () {
	"use strict";
	var APP_KEY = null,
		SECRET_KEY = null,
		REGISTERED_URL = null,
		ACCESS_TOKEN = null,
		/**
		* @param: {String} hash
		* @api: public
		*/
		getFBData = function (hash) {
			return {
				host: 'graph.facebook.com',
				port: 443,
				path: hash,
				method: 'GET'
			};
		},
		/**
		* @param: {String} token		
		* @api: private
		*/
		setAccessToken = function (token) {
			ACCESS_TOKEN = token;
		};
	//public
	return {
		/**
		* @param: {String} key		
		* @api: public
		*/
		setAppKey : function (key) {
			APP_KEY = key;
			return APP_KEY;
		},
		/**
		* @param: {String} key		
		* @api: public
		*/
		setSecretKey : function (key) {
			SECRET_KEY = key;
			return SECRET_KEY;
		},
		/**
		* @param: {String} url		
		* @api: public
		*/
		setRegisteredURL : function (url) {
			REGISTERED_URL = url;
			return REGISTERED_URL;
		},
		/**
		* @param: {Function} callbackFn
		* @api: public
		*/
		getAuthURL : function (callbackFn) {
			if (!APP_KEY) {
				return false;
			}
			if (typeof REGISTERED_URL === 'undefined') {
				console.log("Missing REGISTERED_URL");
				return false;
			}
			callbackFn('https://www.facebook.com/dialog/oauth?client_id=' + APP_KEY + '&redirect_uri=' + encodeURIComponent(REGISTERED_URL));
		},
		/**
		* @param: {String} code
		* @param: {Function} callbackFn
		* @api: public
		*/
		getAccessToken : function (code, callbackFn) {
			if (!SECRET_KEY) {
				return false;
			}
			if (code === '') {
				return false;
			}
			var
				hash = '/oauth/access_token?client_id=' + APP_KEY +
				'&redirect_uri=' +
				encodeURIComponent(REGISTERED_URL) +
				'&client_secret=' + SECRET_KEY +
				'&code=' + code;
			console.log("Consultando getAccessToken em:" + hash);
			https.get(getFBData(hash), function (res) {
				res.setEncoding('utf8');
				res.on('data', function (token) {
					if (token.indexOf('access_token') === -1) {
						token = JSON.parse(token);
						console.log('Error on code request: ' + token.error.message + '-' + token.error.type);
						callbackFn(false);
						return;
					}

					//setAccessToken(token);
					callbackFn(token);
				});
			}).on('error', function (e) {
				console.log('Cant request facebook. Error: ' + e.message);
			});
		},
		/**
		* @param: {Object} params
		* @param: {Function} callbackFn
		* @api: public 
		*/
		getGraph : function (params, callbackFn) {
			params = params || {};
			var
				id = params.id || 'me',
				connectionType = params.connectionType || '',
				queryString = params.queryString || '',
				token = params.token || '',
				hash = '/' + id + '/' + connectionType + '?access_token=' + token + '&' + queryString;
			console.log("Get GRAPH " + hash);
			https.get(getFBData(hash), function (res) {
				var buffer = '';
				res.setEncoding('utf8');
				res.on('data', function (d) {
					buffer += d;
				});
				res.on('end', function (d) {
					callbackFn(JSON.parse(buffer));
				});
			}).on('error', function (e) {
				console.log('Error requesting graph api URL. Error: ' + e.message);
			});
		}
	};
};
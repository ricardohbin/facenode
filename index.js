/**
 * FaceNode
 */

var https = require('https');

module.exports = function() {
	
	var 
		APP_KEY = null,
		SECRET_KEY = null,
		REGISTERED_URL = null,
		getFBData = function(hash) {
			return {
				host: 'graph.facebook.com',
				port: 443,
				path: hash,	
				method: 'GET'
			}
		};	
	
	//public
	return {
		setAppKey : function(key) {
			return APP_KEY = key;
		},
		setSecretKey : function(key) {
			return SECRET_KEY = key;
		},
		setRegisteredURL : function(url) {
			return REGISTERED_URL = url;
		},
		getAuthURL : function(callbackFn) {
			if(!APP_KEY) {
				return false;
			};
			
			if(typeof REGISTERED_URL == 'undefined') {
				console.log("É necessário um REGISTERED_URL");
				return false;
			};
			
			callbackFn('https://www.facebook.com/dialog/oauth?client_id=' + APP_KEY + '&redirect_uri=' + encodeURIComponent(REGISTERED_URL));		
		},
		getAccessToken : function(code,callbackFn) {
			if(!SECRET_KEY) {
				return false;
			};			
			
			if(code == '') {				
				return false;
			};
			
			var 
				hash =  '/oauth/access_token?client_id='+ APP_KEY + 
					'&redirect_uri='+ encodeURIComponent(REGISTERED_URL) +
					'&client_secret='+ SECRET_KEY +
					'&code='+code;				
			
			console.log("Consultando getAccessToken em:" + hash);
					
			var doRequest = https.get(getFBData(hash),function(res) {
				res.setEncoding('utf8');
				res.on('data', function (token) {
					if(token.indexOf('access_token') == -1) {
						var token = JSON.parse(token);
						console.log("Ocorreu um erro na requisição do código: " + token.error.message + "-" + token.error.type);
						callbackFn(false);
						return;
					}
					callbackFn(token);
				});
			}).on('error', function(e) {
				console.log('Problemas na request para o FB. URL Inválida? ' + e.message);
			});
		},
		User : {
			get : function(access_token,callbackFn,id) {
				var hash = '/' + (typeof id == 'number'?id:'me') +'?access_token=' + access_token;
				var doRequest = https.get(getFBData(hash),function(res) {
					res.setEncoding('utf8');
					res.on('data', function (data) {
						callbackFn(JSON.parse(data));
					});
				}).on('error', function(e) {
					console.log('Problemas na request -> ' + e.message);
				});
			},
			me : function(access_token,callbackFn) {
				this.get(access_token,callbackFn);
			}
		}
	};
	
	
}();
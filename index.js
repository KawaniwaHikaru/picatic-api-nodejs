const Promise = require('bluebird');
const Picatic = require('./lib/picatic');
let api_options = require('./access_key.js')

api_options.api_version = 'v2';

let client = new Picatic(api_options);
let params = {};

// client.get('user/me', params, (err, data, res) => {
// 	 console.log(data);
// });

// client.get('user/577072', params)
// 	.then((data) =>{
// 		console.log(data);
// 	})

client.get('event', params)
	.then((data) =>{
		console.log(data);
	})
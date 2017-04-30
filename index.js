const Promise = require('bluebird');
const Picatic = require('./lib/picatic');
let api_options = require('./access_key.js')

api_options.api_version = 'v1';

let client = new Picatic(api_options);
let params = {};

client.get('user/me', params, (err, data, res) => {
	console.log(err,data,res);
});

/*
 request({
 uri:'users/me',
 headers: {
 "X-Picatic-Access-Key": "c90ce778d4d907d08b7b14654c9ce6f599243a16",
 'content-type': 'application/json'
 }
 }, (err, res, body) => {

 if (err) console.log(err);
 else {
 console.log(JSON.parse(body));
 }
 });

 */

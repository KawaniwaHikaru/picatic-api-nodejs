const Picatic = require('./lib/picatic');

const access_key = require('./access_key.js')

console.log(access_key);
let client = new Picatic(access_key);

let params = {};

client.get('users/me', params, function (err, data, res) {
    if (!err) {
        console.log(data);
    }
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
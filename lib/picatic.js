'use strict';

const url = require('url');
const request = require('request');
const extend = require('deep-extend');
let VERSION = require('../package.json').version;

function Picatic(options) {

    if (!(this instanceof Picatic)) {
        return new Picatic(options)
    }
    this.VERSION = VERSION;

    this.options = extend({
        access_key: null,
        rest_base: 'https://api.picatic.com',
        api_version: 'v2',
        request_options: {
            headers: {
                Accept: '*/*',
                Connection: 'close',
                'content-type': 'application/json',
                'User-Agent': 'node-picatic/' + VERSION
            }
        }
    }, options);

    let authentication_options = {
        headers: {
            "X-Picatic-Access-Key": this.options.access_key
        }
    };

    // Configure default request options
    this.request = request.defaults(
        extend(
            this.options.request_options,
            authentication_options
        )
    );

    // Check if Promise present
    this.allow_promise = (typeof Promise === 'function');
}

Picatic.prototype.__buildEndpoint = function (path, base) {
    var bases = {
        'rest': this.options.rest_base + '/' + this.options.api_version
    };
    var endpoint = (bases.hasOwnProperty(base)) ? bases[base] : bases.rest;

    if (url.parse(path).protocol) {
        endpoint = path;
    }
    else {
        // If the path begins with media or /media
        if (path.match(/^(\/)?media/)) {
            endpoint = bases.media;
        }
        endpoint += (path.charAt(0) === '/') ? path : '/' + path;
    }

    // Remove trailing slash
    endpoint = endpoint.replace(/\/$/, '');

    // Add json extension if not provided in call
    // endpoint += (path.split('.').pop() !== 'json') ? '.json' : '';

    return endpoint;
};

Picatic.prototype.__request = function (method, path, params, callback) {
    let base = 'rest', promise = false;

    // Set the callback if no params are passed
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    // Return promise if no callback is passed and promises available
    else if (callback === undefined && this.allow_promise) {
        promise = true;
    }

    // Set API base
    if (typeof params.base !== 'undefined') {
        base = params.base;
        delete params.base;
    }

    // Build the options to pass to our custom request object
    let options = {
        method: method.toLowerCase(),  // Request method - get || post
        url: this.__buildEndpoint(path, base) // Generate url
    };

    // Pass url parameters if get
    if (method === 'get') {
        options.qs = params;
    }

    // Pass form data if post
    if (method === 'post') {
        let formKey = 'form';

        if (typeof params.media !== 'undefined') {
            formKey = 'formData';
        }
        options[formKey] = params;
    }

    // Promisified version
    if (promise) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.request(options, function (error, response, data) {
                // request error
                if (error) {
                    return reject(error);
                }

                // JSON parse error or empty strings
                try {
                    // An empty string is a valid response
                    if (data === '') {
                        data = {};
                    }
                    else {
                        data = JSON.parse(data);
                    }
                }
                catch (parseError) {
                    return reject(new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage));
                }

                // response object errors
                // This should return an error object not an array of errors
                if (data.errors !== undefined) {
                    return reject(data.errors);
                }

                // status code errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    return reject(new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage));
                }

                // no errors
                resolve(data);
            });
        });
    }

    // Callback version
    this.request(options, function (error, response, data) {
        // request error
        if (error) {
            return callback(error, data, response);
        }

        // JSON parse error or empty strings
        try {
            // An empty string is a valid response
            if (data === '') {
                data = {};
            }
            else {
                data = JSON.parse(data);
            }
        }
        catch (parseError) {
            return callback(
                new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage),
                data,
                response
            );
        }


        // response object errors
        // This should return an error object not an array of errors
        if (data.errors !== undefined) {
            return callback(data.errors, data, response);
        }

        // status code errors
        if (response.statusCode < 200 || response.statusCode > 299) {
            return callback(
                new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage),
                data,
                response
            );
        }
        // no errors
        callback(null, data, response);
    });

};


/**
 * GET
 */
Picatic.prototype.get = function (url, params, callback) {
    return this.__request('get', url, params, callback);
};

/**
 * POST
 */
Picatic.prototype.post = function (url, params, callback) {
    return this.__request('post', url, params, callback);
};

module.exports = Picatic;
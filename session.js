"use strict";

const error = require('debug')('error'),
    debug = require('debug')('session');

function Session(config) {

    const serverURL = (process.env.SERVER_URL) ?
        (process.env.SERVER_URL) :
        config.serverURL || '';

    this.conf = {
        serverURL: serverURL,
        storage: {}
    };

}

Session.prototype.buildServerUrl = function (path) {
    return this.conf.serverURL + path;
};

Session.prototype.get = function (key) {
    if (null === this.conf.storage[key]) {
        this.conf.storage[key] = {};
    }
    return this.conf.storage[key];
};

Session.prototype.rm = function (key) {
    if (null === this.conf.storage[key]) {} else {
        this.conf.storage[key] = null;
    }
};

Session.prototype.getValue = function (key, prop) {
    return (this.get(key)[prop]);
};

Session.prototype.setValue = function (key, prop, value) {
  this.get(key)[prop] = value;
};

Session.prototype.userSession = function (key) {
    return this.ensure(key, 'userSession');
};

Session.prototype.ensure = function (key, prop, inital) {
    var keyObj = this.get(key);
    if (keyObj[prop]) {
        //NOOP
    } else {
        keyObj[prop] = inital || {};
    }
    return this.getValue(key, prop);
};

Session.prototype.load = function (key, prop, force, loader, callback) {
    debug('checking', key, prop);
    if (!force && this.get(key)[prop]) {
        debug('cache hit', key, prop);
        callback(null, this.get(key)[prop]);
    } else {
        debug('cache miss', key, prop);
        loader((err, data) => {
            if (err) {
                debug('loaded with error', key, prop, data);
                callback(err, null);
            } else {
                debug('loaded', key, prop, data);
                this.get(key)[prop] = data;
                callback(null, this.get(key)[prop]);

            }
        });
    }
};

Session.prototype.clean = function (key) {
    this.conf.storage[key] = {};
};

module.exports.Session = Session;
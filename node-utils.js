"use strict";

module.exports = {
    session: function () {
        return require('./session');
    },
    dumper: function () {
        return require('./dumper');
    },
    datasource: function () {
        return require('./datasource');
    },
    collectionroutes: function () {
        return require('./collection-routes');
    }
}
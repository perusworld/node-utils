"use strict";

const uuidV4 = require('uuid/v4'),
  async = require('async'),
  debug = require('debug')('datasource'),
  error = require('debug')('error');
var merge = require("merge");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

function DataSource(opts, callback) {

  const mongodbURI = (process.env.MONGODB_URI) ?
    (process.env.MONGODB_URI) :
    opts.mongodbURI;
  this.conf = merge({}, opts, {
    mongodbURI: mongodbURI
  });
  this.db = null;
  this.open(callback);
}

DataSource.prototype.open = function (callback) {
  var ptr = this;
  this.close();
  mongodb.MongoClient.connect(this.conf.mongodbURI, function (err, database) {
    if (err) {
      error(err);
      if (callback) {
        callback(err, null);
      }
    } else {
      ptr.db = database;
      debug("Database connection ready");
      async.nextTick(() => {
        callback(null, ptr);
      });
    }
  });
};

DataSource.prototype.close = function () {
  if (null !== this.db) {
    this.db.close();
    this.db = null;
  }
};

function Model(dataSource, collectionName) {
  this.conf = {
    dataSource: dataSource,
    colName: collectionName
  };
}

Model.prototype.translateId = function (id) {
  return new mongodb.ObjectID(id);
};

Model.prototype.has = function (qry, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).findOne(qry, function (err, doc) {
    if (err) {
      callback(err, false);
    } else {
      callback(null, null !== doc);
    }
  });
};

Model.prototype.find = function (qryObj, callback, opts) {
  var qry = this.conf.dataSource.db.collection(this.conf.colName).find(qryObj);
  if (opts && opts.limit) {
    qry = qry.limit(opts.limit);
  }
  qry.toArray((err, docs) => {
    if (err) {
      callback(err, false);
    } else {
      callback(null, docs);
    }
  });
};

Model.prototype.getById = function (id, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).findOne({
    _id: id
  }, function (err, doc) {
    if (err) {
      callback(err, false);
    } else {
      callback(null, doc);
    }
  });
};

Model.prototype.getByIdAndDelete = function (id, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).findOneAndDelete({
    _id: id
  }, function (err, res) {
    if (err) {
      callback(err, false);
    } else {
      callback(null, res.value);
    }
  });
};

Model.prototype.get = function (qry, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).findOne(qry, function (err, doc) {
    if (err) {
      callback(err, false);
    } else {
      callback(null, doc);
    }
  });
};

Model.prototype.add = function (obj, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).insertOne(obj, function (err, resp) {
    if (err) {
      callback(err, null);
    } else if (1 == resp.insertedCount) {
      callback(null, {
        _id: resp.insertedId
      });
    } else {
      callback(resp.insertedCount, null);
    }
  });
};

Model.prototype.update = function (obj, callback) {
  if (obj._id) {
    this.conf.dataSource.db.collection(this.conf.colName).findOneAndReplace({
      _id: obj._id
    }, obj, {
        returnOriginal: true
      }, function (err, resp) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, {
            _id: resp.value._id
          });
        }
      });
  } else {
    this.add(obj, callback);
  }
};

Model.prototype.delete = function (obj, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).deleteOne({
    _id: obj._id
  }, function (err, doc) {
    if (err) {
      callback(err, false);
    } else {
      callback(null, 1 === doc.deletedCount);
    }
  });
};

Model.prototype.deleteMany = function (qry, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).deleteMany(qry, function (err, res) {
    if (err) {
      callback(err, -1);
    } else {
      callback(null, res.deletedCount);
    }
  });
};

Model.prototype.insertMany = function (arr, callback) {
  this.conf.dataSource.db.collection(this.conf.colName).insertMany(arr, function (err, res) {
    if (err) {
      callback(err, 0);
    } else {
      callback(null, res.insertedCount);
    }
  });
};

function Nonce(opts, dataSource, callback) {
  this.conf = merge({
    colName: 'nonces',
    expireAfterSeconds: 300,
    oneTimeUse: false
  }, opts);
  this.nonceModel = new Model(dataSource, this.conf.colName);
  this.ensureIdx(callback);
}

Nonce.prototype.ensureIdx = function (callback) {
  var ptr = this;
  ptr.nonceModel.conf.dataSource.db.collection(ptr.conf.colName).createIndex({
    "createdAt": 1
  }, {
      expireAfterSeconds: ptr.conf.expireAfterSeconds
    }, (err, resp) => {
      if (err) {
        error(err);
        if (callback) {
          callback(err, false);
        }
      } else {
        if (callback) {
          callback(null, ptr);
        }
      }
    });
};

Nonce.prototype.getNonce = function (token, callback) {
  if (this.conf.oneTimeUse) {
    this.nonceModel.getByIdAndDelete(token, callback);
  } else {
    this.nonceModel.getById(token, callback);
  }
};

Nonce.prototype.addNonceWith = function (nonce, key, callback) {
  this.nonceModel.add({
    _id: nonce,
    key: key,
    createdAt: new Date()
  }, (err, ins) => {
    if (err) {
      callback(err, null);
    } else if (ins) {
      callback(null, nonce);
    }
  });
};

Nonce.prototype.addNonce = function (key, callback) {
  this.addNonceWith(uuidV4(), key, callback);
};

Nonce.prototype.removeNonce = function (nonce, callback) {
  this.nonceModel.delete({ _id: nonce }, callback);
};

module.exports.DataSource = DataSource;
module.exports.Model = Model;
module.exports.Nonce = Nonce;
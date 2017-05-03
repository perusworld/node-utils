const error = require('debug')('error'),
  debug = require('debug')('dumper'),
  fs = require('fs'),
  async = require('async'),
  moment = require('moment'),
  merge = require("merge");

function Dumper(opts) {
  this.conf = merge({
    dir: './dumps'
  }, opts);
  this.conf.counter = 0;
  if (!fs.existsSync(this.conf.dir)) {
    fs.mkdirSync(this.conf.dir);
  }
}

Dumper.prototype.fileName = function (prefix) {
  return this.conf.dir + "/" + prefix + "." + moment().valueOf() + "." + this.conf.counter++ + ".json";
};

Dumper.prototype.dump = function (prefix, data, callback) {
  var ptr = this;
  async.waterfall([
    function (callback) {
      var filename = ptr.fileName(prefix);
      fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          callback({
            error: err,
            filename: filename
          }, null);
        } else {
          callback(null, filename);
        }
      });
    }
  ], function (err, filename) {
    if (err) {
      debug('Failed writing to ', err.filename);
      error(err.error);
      if (callback) {
        callback(err, null);
      }
    } else {
      if (callback) {
        callback(null, filename);
      }
    }
  });

};

module.exports.Dumper = Dumper;
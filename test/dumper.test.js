const fs = require('fs');

var obj = {
  akey: 'a-key-value',
  bobj: {
    ckey: 'c-key-value'
  }
};

describe('dump', () => {
  var dumperapi = require('../node-utils').dumper();
  var dumper = new dumperapi.Dumper({});

  test('obj', done => {
    dumper.dump('test', obj, (err, filename) => {
      expect(err).toBeNull();
      expect(filename).toBeDefined();
      expect(filename).not.toBeNull();
      expect(JSON.parse(fs.readFileSync(filename))).toEqual(obj);
      done();
    });
  });

});


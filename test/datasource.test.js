var merge = require("merge");

var datasourceapi = require('../node-utils').datasource();

var ctx = {};

var obj = {
  akey: 'a-key-value',
  bobj: {
    ckey: 'c-key-value'
  }
};

beforeAll(done => {
  new datasourceapi.DataSource({ mongodbURI: 'mongodb://localhost:27017/datasource-test' }, (err, datasource) => {
    expect(err).toBeNull();
    expect(datasource).toBeDefined();
    expect(datasource).not.toBeNull();
    ctx.datasource = datasource;
    ctx.aColModel = new datasourceapi.Model(datasource, 'some-collection');
    done();
  });
});

test('ensure datasource', () => {
  expect(ctx.datasource).toBeDefined();
  expect(ctx.datasource).not.toBeNull();
  expect(ctx.aColModel).toBeDefined();
  expect(ctx.aColModel).not.toBeNull();
});

afterAll(() => {
  ctx.aColModel = null;
  if (ctx.datasource) {
    ctx.datasource.close();
    ctx.datasource = null;
  }
});

describe('crud', () => {

  test('save', done => {
    ctx.aColModel.add(merge(true, obj), (err, resp) => {
      expect(err).toBeNull();
      expect(resp).toBeDefined();
      expect(resp).not.toBeNull();
      expect(resp._id).toBeDefined();
      expect(resp._id).not.toBeNull();
      done();
    });
  });

  test('find', done => {
    ctx.aColModel.find(obj, (err, resp) => {
      expect(err).toBeNull();
      expect(resp).toBeDefined();
      expect(resp).not.toBeNull();
      expect(resp.length).toBeDefined();
      expect(0 < resp.length).toBe(true);
      done();
    });
  });

  test('update', done => {
    ctx.aColModel.find(obj, (err, resp) => {
      expect(err).toBeNull();
      resp[0].bobj.ckey = 'updated';
      ctx.aColModel.update(resp[0], (err, uresp) => {
        expect(err).toBeNull();
        expect(uresp._id.toHexString()).toBe(resp[0]._id.toHexString());
        done();
      });
    });
  });

  test('delete many', done => {
    ctx.aColModel.deleteMany({ akey: obj.akey }, (err, deletedCount) => {
      expect(err).toBeNull();
      expect(deletedCount).toBeDefined();
      expect(deletedCount).not.toBeNull();
      expect(0 < deletedCount).toBe(true);
      done();
    });
  });
});

describe('nonce one time use', () => {
  var nonce = null;
  var nKey = 'n-key';
  var expireAfterSeconds = 5;
  var originalTimeout;

  beforeAll(done => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 70 * 1000;
    nonce = new datasourceapi.Nonce({ oneTimeUse: true, expireAfterSeconds: expireAfterSeconds }, ctx.datasource, (err, resp) => {
      expect(err).toBeNull();
      expect(resp).toBeDefined();
      expect(resp).not.toBeNull();
      done();
    });
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  test('add', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      done();
    });
  });

  test('add get', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      nonce.getNonce(nValue, (err, doc) => {
        expect(err).toBeNull();
        expect(doc).toBeDefined();
        expect(doc).not.toBeNull();
        expect(doc.key).toBe(nKey);
        done();
      })
    });
  });

  test('add verify', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      nonce.getNonce(nValue, (err, doc) => {
        expect(err).toBeNull();
        expect(doc).toBeDefined();
        expect(doc).not.toBeNull();
        expect(doc.key).toBe(nKey);
        nonce.getNonce(nValue, (err, doc) => {
          expect(err).toBeNull();
          expect(doc).toBeDefined();
          expect(doc).toBeNull();
          done();
        })
      })
    });
  });

  test('add verify expiry', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      setTimeout(() => {
        nonce.getNonce(nValue, (err, doc) => {
          expect(err).toBeNull();
          expect(doc).toBeDefined();
          expect(doc).toBeNull();
          done();
        })
      }, 61000);

    });
  });
});

describe('nonce multi time use', () => {
  var nonce = null;
  var nKey = 'n-key';
  var expireAfterSeconds = 5;
  var originalTimeout;

  beforeAll(done => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 70 * 1000;
    nonce = new datasourceapi.Nonce({ oneTimeUse: false, expireAfterSeconds: expireAfterSeconds }, ctx.datasource, (err, resp) => {
      expect(err).toBeNull();
      expect(resp).toBeDefined();
      expect(resp).not.toBeNull();
      done();
    });
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  test('add', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      done();
    });
  });

  test('add get', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      nonce.getNonce(nValue, (err, doc) => {
        expect(err).toBeNull();
        expect(doc).toBeDefined();
        expect(doc).not.toBeNull();
        expect(doc.key).toBe(nKey);
        done();
      })
    });
  });

  test('add verify', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      nonce.getNonce(nValue, (err, doc) => {
        expect(err).toBeNull();
        expect(doc).toBeDefined();
        expect(doc).not.toBeNull();
        expect(doc.key).toBe(nKey);
        nonce.getNonce(nValue, (err, doc) => {
          expect(err).toBeNull();
          expect(doc).toBeDefined();
          expect(doc).not.toBeNull();
          expect(doc.key).toBe(nKey);
          done();
        })
      })
    });
  });

  test('add verify expiry', done => {
    nonce.addNonce(nKey, (err, nValue) => {
      expect(err).toBeNull();
      expect(nValue).toBeDefined();
      expect(nValue).not.toBeNull();
      nonce.getNonce(nValue, (err, doc) => {
        expect(err).toBeNull();
        expect(doc).toBeDefined();
        expect(doc).not.toBeNull();
        expect(doc.key).toBe(nKey);
        setTimeout(() => {
          nonce.getNonce(nValue, (err, doc) => {
            expect(err).toBeNull();
            expect(doc).toBeDefined();
            expect(doc).toBeNull();
            done();
          })
        }, 61000);
      })
    });
  });

});
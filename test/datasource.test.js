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
    })
  });

  test('find', done => {
    ctx.aColModel.find(obj, (err, resp) => {
      expect(err).toBeNull();
      expect(resp).toBeDefined();
      expect(resp).not.toBeNull();
      expect(resp.length).toBeDefined();
      expect(0 < resp.length).toBe(true);
      done();
    })
  });

  test('update', done => {
    ctx.aColModel.find(obj, (err, resp) => {
      expect(err).toBeNull();
      resp[0].bobj.ckey = 'updated';
      ctx.aColModel.update(resp[0], (err, uresp) => {
        expect(err).toBeNull();
        expect(uresp._id.toHexString()).toBe(resp[0]._id.toHexString());
        done();
      })
    })
  });

  test('delete many', done => {
    ctx.aColModel.deleteMany({ akey: obj.akey }, (err, deletedCount) => {
      expect(err).toBeNull();
      expect(deletedCount).toBeDefined();
      expect(deletedCount).not.toBeNull();
      expect(0 < deletedCount).toBe(true);
      done();
    })
  });

});


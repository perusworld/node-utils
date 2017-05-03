var key = 'a-key';
var prop = 'a-key-prop';
var value = 'a-key-prop-value';

var ekey = 'e-key';
var eprop = 'e-key-prop';
var evalue = 'e-key-prop-value';

describe('cache miss', () => {
  var sessionapi = require('../node-utils').session();
  var session = new sessionapi.Session({});

  test('empty obj', () => {
    expect(session.get(key)).toEqual({});
  });

  test('not there', () => {
    expect(session.getValue(key, prop)).toBeUndefined();
  });

  test('miss force', done => {
    const loader = jest.fn((callback) => {
      callback(null, value)
    });
    session.load(key, prop, true, loader, (err, loadedValue) => {
      expect(err).toBeNull();
      expect(loadedValue).toBe(value);
      expect(loader).toHaveBeenCalled();
      done();
    });
  });

  test('hit now', done => {
    const loader = jest.fn((callback) => {
      callback(null, value)
    });
    session.load(key, prop, false, loader, (err, loadedValue) => {
      expect(err).toBeNull();
      expect(loadedValue).toBe(value);
      expect(loader).not.toHaveBeenCalled();
      done();
    });
  });
});

describe('cache miss first time', () => {
  var sessionapi = require('../node-utils').session();
  var session = new sessionapi.Session({});

  test('miss', done => {
    const loader = jest.fn((callback) => {
      callback(null, value)
    });
    session.load(key, prop, false, loader, (err, loadedValue) => {
      expect(err).toBeNull();
      expect(loadedValue).toBe(value);
      done();
    });
  });
});

describe('cache hit', () => {
  var sessionapi = require('../node-utils').session();
  var session = new sessionapi.Session({});

  beforeEach(() => {
    session.get(key)[prop] = value;
  });

  test('there', () => {
    expect(session.getValue(key, prop)).toEqual(value);
  });

  test('hit now', done => {
    const loader = jest.fn((callback) => {
      callback(null, value)
    });
    session.load(key, prop, false, loader, (err, loadedValue) => {
      expect(err).toBeNull();
      expect(loadedValue).toBe(value);
      expect(loader).not.toHaveBeenCalled();
      done();
    });
  });

});

describe('rm', () => {
  var sessionapi = require('../node-utils').session();
  var session = new sessionapi.Session({});

  beforeEach(() => {
  });

  test('set', () => {
    expect(session.ensure(ekey, eprop)).toEqual({});
    session.setValue(ekey, eprop, evalue);
    expect(session.getValue(ekey, eprop)).toEqual(evalue);
  });

  test('rm', () => {
    session.rm(ekey);
    expect(session.ensure(ekey, eprop)).toEqual({});
  });

});

describe('ensure', () => {
  var sessionapi = require('../node-utils').session();
  var session = new sessionapi.Session({});

  beforeEach(() => {
  });

  test('set', () => {
    expect(session.ensure(ekey, eprop)).toEqual({});
  });

  test('rm', () => {
    session.rm(ekey);
    expect(session.ensure(ekey, eprop)).toEqual({});
  });

  test('set default', () => {
    session.rm(ekey);
    expect(session.ensure(ekey, eprop, evalue)).toEqual(evalue);
    expect(session.ensure(ekey, eprop, value)).toEqual(evalue);
  });
});
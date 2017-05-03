# Simple Node.js Utils #

[![bitHound Overall Score](https://www.bithound.io/github/perusworld/node-utils/badges/score.svg)](https://www.bithound.io/github/perusworld/node-utils)
[![bitHound Dependencies](https://www.bithound.io/github/perusworld/node-utils/badges/dependencies.svg)](https://www.bithound.io/github/perusworld/node-utils/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/perusworld/node-utils/badges/code.svg)](https://www.bithound.io/github/perusworld/node-utils)

## Install ##
```bash
npm install github:perusworld/node-utils --save
```
## Usage ##
 See the test cases for detailed usage

### Session (in memory cache with loader support) ##
```javascript
var sessionapi = require('node-utils').session();
var session = new sessionapi.Session({});

session.load('key', 'prop', true, (callback) => {
      callback(null, 'a loaded value')
    }, (err, loadedValue) => {
      //handle loaded value
});
```

### Dumper (dump objects to json with timestamped filenames) ##
```javascript
var dumperapi = require('node-utils').dumper();
var dumper = new dumperapi.Dumper({});

//Don't care about the save status
dumper.dump('some-prefix', objectToDump);

//Care about the save status
dumper.dump('some-prefix', objectToDump, (err, filename) => {
  //handle save status
});
```

### DataSource/Model (Simple datasource/model wrapper for mondogb) ##
```javascript
var datasourceapi = require('node-utils').datasource();
new datasourceapi.DataSource({ mongodbURI: 'mongodb://localhost:27017/my-db' }, (err, datasource) => {
  var aColModel = new datasourceapi.Model(datasource, 'some-collection');
  ctx.aColModel.add(myObj, (err, resp) => {
    //resp._id has the object id
  })

});

```



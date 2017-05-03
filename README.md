# Simple Node.js Utils #

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



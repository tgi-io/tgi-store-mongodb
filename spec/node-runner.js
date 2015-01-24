/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-mongodb/spec/node-runner.js
 */
var Spec = require('tgi-spec/dist/tgi.spec.js');
var testSpec = require('../dist/tgi-store-mongodb.spec.js');
var TGI = require('../dist/tgi-store-mongodb');
var _package = require('../package');

if (_package.version != TGI.STORE.MONGODB().version) {
  console.error('Library version %s does not match package.json %s',TGI.CORE().version,_package.version);
  process.exit(1);
}

var spec = new Spec();
testSpec(spec, TGI);
var mongo = require('mongodb');
var MongoStore = TGI.STORE.MONGODB().MongoStore;
var mongoStore = new MongoStore({name: 'Host Test Store'});
mongoStore.onConnect('http://localhost', function (store, err) {
  if (err) {
    console.log('mongoStore unavailable (' + err + ')');
    process.exit(1);
  } else {
    console.log('mongoStore connected');
    spec.runTests(function (msg) {
      if (msg.error) {
        console.log('UT OH: ' + msg.error);
        process.exit(1);
      } else if (msg.done) {
        console.log('Testing completed with  ...');
        console.log('testsCreated = ' + msg.testsCreated);
        console.log('testsPending = ' + msg.testsPending);
        console.log('testsFailed = ' + msg.testsFailed);
        if (msg.testsFailed || msg.testsPending)
          process.exit(1);
        else
          process.exit(0);
      } else if (msg.log) {
        //console.log(msg.log);
      }
    });
  }
  console.log(mongoStore.name + ' ' + mongoStore.storeType);
}, {vendor: mongo, keepConnection: true});

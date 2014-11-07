/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/node-runner.js
 */
var Spec = require('tgi-spec/dist/tgi.spec.js');
var testSpec = require('../dist/tgi-store-mongodb.spec.js');
var spec = new Spec();
var UTILITY = require('tgi-utility/dist/tgi.utility');
var CORE = require('../dist/tgi-store-mongodb.js');
var fs = require('fs');

(function () {
  UTILITY().injectMethods(this);
  CORE().injectMethods(this);
  spec._coreStore = MongoStore;
  testSpec(spec, CORE);

  var mongo = require('mongodb');
  var mongoStore = new MongoStore({name: 'Host Test Store'});
  mongoStore.onConnect('http://localhost', function (store, err) {
    if (err) {
      console.log('mongoStore unavailable (' + err + ')');
      process.exit(1);
    } else {
      console.log('mongoStore connected');
      spec.runTests(function (msg) {
        if (msg.error) {
          console.log(msg.error);
          process.exit(1);
        } else if (msg.done) {
          console.log('Testing completed with  ...');
          console.log('testsCreated = ' + msg.testsCreated);
          console.log('testsPending = ' + msg.testsPending);
          console.log('testsFailed = ' + msg.testsFailed);
          if (msg.testsFailed || msg.testsPending) {
            fs.writeFileSync('spec/README.md', spec.githubMarkdown(), 'utf8');
            process.exit(1);
          } else {
            fs.writeFileSync('spec/README.md', spec.githubMarkdown(), 'utf8');
            process.exit(0);
          }
        } else if (msg.log) {
          //console.log(msg.log);
        }
      });
    }
  }, {vendor:mongo, keepConnection: true});

}());



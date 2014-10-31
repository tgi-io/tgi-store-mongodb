/**---------------------------------------------------------------------------------------------------------------------
 * tgi-core/lib/misc/test-header
 **/
(function () {
"use strict";
var root = this;
var testSpec = function(spec,CORE) {
/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-mongodb/lib/tgi-store-mongodb.spec.js
 */
/**
 * Doc Intro
 */
spec.test('lib/tgi-store-mongodb.spec.js', 'MONGODB', '', function (callback) {
  spec.heading('MongoStore', function () {
    spec.paragraph('The MongoStore handles data storage via MongoDB.');
    spec.heading('CONSTRUCTOR', function () {
      spec.heading('Store Constructor tests are applied', function () {
        //spec.runnerStoreConstructor(MongoStore,true);
      });
      spec.example('objects created should be an instance of MongoStore', true, function () {
        // return new MongoStore() instanceof MongoStore;
        return new Store() instanceof Store;
      });
    });
    spec.heading('Store tests are applied', function () {
      //spec.runnerStoreMethods(MongoStore,true);
    });
  });
});

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-core/lib/misc/test-footer
 **/
};
  /* istanbul ignore next */
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = testSpec;
    }
    exports.testSpec = testSpec;
  } else {
    root.testSpec = testSpec;
  }
}).call(this);
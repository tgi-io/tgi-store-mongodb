/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-mongodb/lib/tgi-store-mongodb.spec.js
 */
/**
 * Doc Intro
 */
spec.mute(false);
spec.test('lib/tgi-store-mongodb.spec.js', 'MONGODB', '', function (callback) {
  spec.heading('MongoStore', function () {
    spec.paragraph('The MongoStore handles data storage via MongoDB.');
    spec.heading('CONSTRUCTOR', function () {
      spec.heading('Store Constructor tests are applied', function () {
        spec.runnerStoreConstructor(MongoStore,true);
      });
      spec.example('objects created should be an instance of MongoStore', true, function () {
        return new MongoStore() instanceof MongoStore;
      });
    });
    spec.heading('Store tests are applied', function () {
      spec.runnerStoreMethods(MongoStore,true);
    });
  });
});

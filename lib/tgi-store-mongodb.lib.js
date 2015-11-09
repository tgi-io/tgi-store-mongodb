/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-mongodb/lib/tgi-store-mongodb.lib.js
 */
TGI.STORE = TGI.STORE || {};
TGI.STORE.MONGODB = function () {
  return {
    version: '0.0.7',
    MongoStore: MongoStore
  };
};

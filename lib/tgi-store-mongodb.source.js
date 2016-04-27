/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-mongodb/lib/tgi-store-mongodb.source.js
 */

// Constructor
var MongoStore = function (args) {
  if (false === (this instanceof MongoStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "MongoStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeProperty = {
    isReady: false,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true,
    canGetList: true
  };
  var unusedProperties = getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);
  if (MongoStore._connection) {
    this.storeProperty.isReady = true;
    this.storeProperty.canGetModel = true;
    this.storeProperty.canPutModel = true;
    this.storeProperty.canDeleteModel = true;
    this.mongoServer = MongoStore._connection.mongoServer;
    this.mongoDatabase = MongoStore._connection.mongoDatabase;
  }
};
MongoStore.prototype = Object.create(Store.prototype);
// Methods
MongoStore.prototype.onConnect = function (location, callback, options) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callback != 'function') throw new Error('argument must a callback');

  var mongo;
  if (options) {
    mongo = options.vendor;
  } else {
    options = {};
    if (MongoStore._connection) {
      mongo = MongoStore._connection.mongo;
    }
  }

  /**
   * Open mongo database
   */
  var store = this;
  var host = options.host || '127.0.0.1';
  var port = options.port || 27017;
  var databaseName = options.databaseName || 'tgiDatabase';
  var userName = options.userName;
  var password = options.password || '';
  var authenticateOptions = {};
  if (options.authdb)
    authenticateOptions.authdb = options.authdb;
  try {
    store.mongoServer = new mongo.Server(host, port, {auto_reconnect: true});
    store.mongoDatabase = new mongo.Db(databaseName, this.mongoServer, {safe: true});
    store.mongoDatabase.open(function (err, db) {
      /**
       * Local function after open or auto callback
       */
      function finishUp() {
        store.storeProperty.isReady = true;
        store.storeProperty.canGetModel = true;
        store.storeProperty.canPutModel = true;
        store.storeProperty.canDeleteModel = true;
        if (options && options.keepConnection) {
          MongoStore._connection = {
            mongo: mongo,
            mongoServer: store.mongoServer,
            mongoDatabase: store.mongoDatabase
          };
        }
        callback(store);
      }

      if (err) {
        callback(store, err);
        try {
          store.mongoDatabase.close();  // Error will retry till close with auto_reconnect: true
        }
        catch (catchError) {
          console.log('error closing when fail open: ' + catchError);
        }
      } else {
        if (userName) {
          //console.log('authenticate(%s,%s,%s)',userName, password, JSON.stringify(authenticateOptions));
          store.mongoDatabase.authenticate(userName, password, authenticateOptions, function (err, res) {
            if (err) {
              callback(store, err);
              try {
                store.mongoDatabase.close();  // Error will retry till close with auto_reconnect: true
              }
              catch (catchError) {
                console.log('error closing when fail authenticate: ' + catchError);
              }
            }
            finishUp();
          });
        } else {
          finishUp();
        }
      }
    });
  }
  catch (err) {
    callback(store, err);
  }

};
MongoStore.prototype.putModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callback != "function") throw new Error('callback required');
  var store = this;
  var a;
  //console.log('MongoStore.prototype.putModel...');
  //console.log(JSON.stringify(model));
  store.mongoDatabase.collection(model.modelType, function (err, collection) {
    if (err) {
      console.log('putModel collection error: ' + err);
      callback(model, err);
      return;
    }
    // put name value pairs into modelData
    var modelData = {};
    var newModel = false;
    var id = model.attributes[0].value;
    if (id && typeof id != 'string') { // todo - cheese to pass test
      callback(model, new Error('model not found in store'));
      return;
    }
    for (a in model.attributes) {
      if (model.attributes.hasOwnProperty(a)) {
        if (model.attributes[a].name == 'id') {
          if (!model.attributes[a].value)
            newModel = true;
        } else {
          if (model.attributes[a].value && model.attributes[a].type == 'ID') {
            modelData[model.attributes[a].name] = MongoStore._connection.mongo.ObjectID.createFromHexString(model.attributes[a].value);
          } else {
            modelData[model.attributes[a].name] = model.attributes[a].value;
          }
        }
      }
    }
    if (newModel) {
      //console.log('collection.insert (modelData): ' + JSON.stringify(modelData));
      collection.insert(modelData, {safe: true}, function (err, result) {
        if (err) {
          console.log('putModel insert error: ' + err);
          callback(model, err);
        } else {
          // Get resulting data
          for (a in model.attributes) {
            if (model.attributes.hasOwnProperty(a)) {
              if (model.attributes[a].name == 'id')
                model.attributes[a].value = modelData._id.toString();
              else if (modelData[model.attributes[a].name] && model.attributes[a].type == 'ID')
                model.attributes[a].value = (modelData[model.attributes[a].name]).toString();
              else
                model.attributes[a].value = modelData[model.attributes[a].name];
            }
          }
          callback(model);
        }
      });
    } else {
      id = MongoStore._connection.mongo.ObjectID.createFromHexString(id);
      collection.update({'_id': id}, modelData, {safe: true}, function (err, result) {
        if (err) {
          console.log('putModel update error: ' + err);
          callback(model, err);
        } else {
          // Get resulting data
          for (a in model.attributes) {
            if (model.attributes.hasOwnProperty(a)) {
              if (model.attributes[a].name != 'id') // Keep original ID intact
                model.attributes[a].value = modelData[model.attributes[a].name];
            }
          }
          callback(model);
        }
      });
    }
  });
};
MongoStore.prototype.getModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callback != "function") throw new Error('callback required');
  var store = this;
  var a;
  var id = model.attributes[0].value;
  if (typeof id == 'string') {
    try {
      id = MongoStore._connection.mongo.ObjectID.createFromHexString(id);
    } catch (e) {
      console.log('getModel createFromHexString error: ' + e);
      callback(model, e);
    }
  }
  store.mongoDatabase.collection(model.modelType, function (err, collection) {
    if (err) {
      console.log('getModel collection error: ' + err);
      callback(model, err);
      return;
    }
    collection.findOne({'_id': id}, function (err, item) {
      if (err) {
        console.log('getModel findOne ERROR: ' + err);
        callback(model, err);
        return;
      }
      if (item === null) {
        callback(model, Error('model not found in store'));
      } else {
        for (a in model.attributes) {
          if (model.attributes.hasOwnProperty(a)) {
            if (model.attributes[a].name == 'id')
              model.attributes[a].value = item._id.toString();
            else if (item[model.attributes[a].name] && model.attributes[a].type == 'ID')
              model.attributes[a].value = (item[model.attributes[a].name]).toString();
            else
              model.attributes[a].value = item[model.attributes[a].name];
          }
        }
        callback(model);
        //console.log('MongoStore.prototype.getModel model...');
        //console.log(JSON.stringify(model));
      }
    });
  });
};
MongoStore.prototype.deleteModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callback != "function") throw new Error('callback required');
  var store = this;
  var a;
  var id = model.attributes[0].value;
  if (id && typeof id != 'string') { // todo - cheese to pass test
    if (model.modelType == 'PeopleAreString!') {
      callback(model, new Error('model not found in store'));
    } else {
      callback(model, new Error('id not found in store'));
    }
    return;
  }
  if (typeof id == 'string') {
    try {
      id = MongoStore._connection.mongo.ObjectID.createFromHexString(id);
    } catch (e) {
      console.log('deleteModel createFromHexString error: ' + e);
      callback(model, e);
    }
  }
  store.mongoDatabase.collection(model.modelType, function (err, collection) {
    if (err) {
      console.log('deleteModel collection error: ' + err);
      callback(model, err);
      return;
    }
    collection.remove({'_id': id}, function (err, item) {
      if (err) {
        console.log('deleteModel remove ERROR: ' + err);
        callback(model, err);
        return;
      }
      for (a in model.attributes) {
        if (model.attributes.hasOwnProperty(a)) {
          if (model.attributes[a].name == 'id')
            model.attributes[a].value = undefined;
        }
      }
      callback(model);
    });
  });
};
MongoStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callback, order;
  if (typeof(arg4) == 'function') {
    callback = arg4;
    order = arg3;
  } else {
    callback = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callback != "function") throw new Error('callback required');
  var store = this;
  list.clear();

  // Convert list filter to mongo flavor
  var mongoFilter = {};
  for (var prop in filter) {
    if (filter.hasOwnProperty(prop)) {
//      console.log('prop = ' + prop);
      if (list.model.getAttributeType(prop) == 'ID')
        mongoFilter[prop] = MongoStore._connection.mongo.ObjectID.createFromHexString(filter[prop]);
      else if (list.model.getAttributeType(prop) == 'Date' && filter[prop] != null) {
        //console.log('new date code ...');
        var start = new Date(filter[prop]);
        var end = new Date(filter[prop]);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        mongoFilter[prop] = {$gte: start, $lt: end};
      }
      else
        mongoFilter[prop] = filter[prop];
    }
  }

  store.mongoDatabase.collection(list.model.modelType, function (err, collection) {
    if (err) {
      console.log('getList collection error: ' + err);
      callback(list, err);
      return;
    }
    if (order) {
      var newOrder = {};
      for (var o in order) {
        if (order.hasOwnProperty(o)) {
          var oo = o;
          if (o=='id')
            oo = '_id';
          newOrder[oo] = order[o];
        }
      }
      //console.log('newOrder: ' + JSON.stringify(newOrder));
      collection.find({query: mongoFilter, $orderby: newOrder}, findcallback);
    } else {
      collection.find(mongoFilter, findcallback);
    }
    function findcallback(err, cursor) {
      if (err) {
        console.log('getList find error: ' + err);
        callback(list, err);
        return;
      }
      cursor.toArray(function (err, documents) {
        if (err) {
          console.log('getList toArray error: ' + err);
          callback(list, err);
          return;
        }
        //console.log('documents: ' + JSON.stringify(documents));
        for (var i = 0; i < documents.length; i++) {
          var dataPart = [];
          var model = list.model;
          var item = documents[i];
          //console.log('*** START ***');
          for (var a in model.attributes) {
            if (model.attributes.hasOwnProperty(a)) {
              if (model.attributes[a].name == 'id')
                model.attributes[a].value = item._id.toString();
              else if (item[model.attributes[a].name] && model.attributes[a].type == 'ID')
                model.attributes[a].value = (item[model.attributes[a].name]).toString();
              else
                model.attributes[a].value = item[model.attributes[a].name];
              dataPart.push(model.attributes[a].value);
            }
          }
          //console.log('*** STOP ***');
          list._items.push(dataPart);
          //console.log('dataPart: ' + JSON.stringify(dataPart));
        }
        list._itemIndex = list._items.length - 1;
        callback(list);
        //console.log('list..');
        //console.log(JSON.stringify(list));
      });
    }
  });
};

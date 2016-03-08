
*215 model tests applied*    

## [&#9664;](#-model)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-request) &nbsp;Procedure
#### Procedure Class
The `Procedure` class manages a set of `Command` objects.  It provides a pattern for handling asynchronous and synchronous command execution.    

`Command` objects create and manage the `Procedure` object.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Procedure:</i></b>
```javascript
return new Procedure() instanceof Procedure;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
Procedure(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure argument properties are valid:</i></b>
```javascript
new Procedure({yo: 'whatup'});
```
<blockquote><strong>Error: error creating Procedure: invalid property: yo</strong> thrown as expected
</blockquote>
#### PROPERTIES
#### tasks
Tasks is an array of objects that represent each step of the procedure.  See TASKS section below for each property of this unnamed object (task array element).    

&nbsp;<b><i>tasks can be falsy if no tasks defined otherwise it has to be an array:</i></b>
```javascript
new Procedure({tasks: true});
```
<blockquote><strong>Error: error creating Procedure: tasks is not an array</strong> thrown as expected
</blockquote>
&nbsp;<b><i>the parameters must be valid for the object in each element of the array:</i></b>
```javascript
new Procedure({
  tasks: [
    {clean: 'room'}
  ]
});
```
<blockquote><strong>Error: error creating Procedure: invalid task[0] property: clean</strong> thrown as expected
</blockquote>
#### tasksNeeded
Total tasks that will execute (does not include skipped tasks).    

_See Integration Tests for usage_    

#### tasksCompleted
Number of tasks completed and started (does not include skipped tasks)    

_See Integration Tests for usage_    

#### TASKS
Each element of the array tasks is an object with the following properties:    

#### label
optional label for this task element    

&nbsp;<b><i>if used it must be a string:</i></b>
```javascript
new Procedure({
  tasks: [
    {label: true}
  ]
});
```
<blockquote><strong>Error: error creating Procedure: task[0].label must be string</strong> thrown as expected
</blockquote>
#### command
Command to execute for this task    

&nbsp;<b><i>if used it must be a `Command`:</i></b>
```javascript
new Procedure({
  tasks: [
    {command: true}
  ]
});
```
<blockquote><strong>Error: error creating Procedure: task[0].command must be a Command object</strong> thrown as expected
</blockquote>
#### requires
Establish other tasks that must be complete before this task is executed.  Pass as array of or single element. Can be string(for label label) or number(for array index).  Use -1 for previous task, null for no dependencies    

&nbsp;<b><i>test it:</i></b>
```javascript
this.shouldThrowError(Error('invalid type for requires in task[0]'), function () {
  new Procedure({
    tasks: [
      {requires: new Date()}
    ]
  });
});
// if number supplied it is index in array
this.shouldThrowError(Error('missing task #1 for requires in task[0]'), function () {
  new Procedure({
    tasks: [
      {command: new Procedure({}), requires: 1}
    ]
  });
});
this.shouldThrowError(Error('task #-2 invalid requires in task[0]'), function () {
  new Procedure({
    tasks: [
      {command: new Procedure({}), requires: -2}
    ]
  });
});
// requires defaults to -1 which means the previous element in the array so essentially the default
// is sequential processing.  Set to null for no dependencies which makes it asynchronous -1 means
// previous element is ignored for first index and is the default
var proc = new Procedure({
  tasks: [
    {command: new Command({})}
  ]
});
this.shouldBeTrue(proc.tasks[0].requires == -1);
```
#### METHODS
#### getObjectStateErrors
&nbsp;<b><i>should return array of validation errors:</i></b>
```javascript
if (!new Procedure().getObjectStateErrors()) return 'falsy';
```
<blockquote>returns <strong>falsy</strong> as expected
</blockquote>
#### INTEGRATION
&nbsp;<b><i>synchronous sequential tasks are the default when tasks has no requires property:</i></b>
```javascript
var cmd = new Command({
  name: 'cmdProcedure', type: 'Procedure', contents: new Procedure({
    tasks: [
      {
        command: new Command({
          type: 'Function',
          contents: function () {
            var self = this;
            setTimeout(function () {
              self._parentProcedure.bucket += '1';
              self.complete();
            }, 250); // delayed to test that order is maintained
          }
        })
      },
      {
        command: new Command({
          type: 'Function',
          contents: function () {
            this._parentProcedure.bucket += '2';
            this.complete();
          }
        })
      },
      function () { // shorthand version of command function ...
        this._parentProcedure.bucket += '3';
        this.complete();
      }
    ]
  })
});
cmd.onEvent('*', function (event) {
  if (event == 'Completed') callback(cmd.bucket);
});
cmd.bucket = 'abc';
cmd.execute();
```
<blockquote>returns <strong>abc123</strong> as expected
</blockquote>
&nbsp;<b><i>async tasks are designated when requires is set to null:</i></b>
```javascript
var execCount = 0; // Call twice to test reset state
var cmd = new Command({
  name: 'cmdProcedure', type: 'Procedure', contents: new Procedure({
    tasks: [
      {
        command: new Command({
          type: 'Function',
          contents: function () {
            var self = this;
            setTimeout(function () {
              self._parentProcedure.bucket += ' mo';
              self.complete();
            }, 50); // This will be done last
          }
        })
      },
      {
        requires: null, // no wait to run this
        command: new Command({
          type: 'Function',
          contents: function () {
            this._parentProcedure.bucket += ' miney';
            this.complete();
          }
        })
      }
    ]
  })
});
cmd.onEvent('*', function (event) {
  if (event == 'Completed') {
    if (execCount++ < 2) {
      cmd.execute();
    } else {
      callback(cmd.bucket);
    }
  }
});
cmd.bucket = 'eenie meenie';
execCount++;
cmd.execute();
```
<blockquote>returns <strong>eenie meenie miney mo miney mo</strong> as expected
</blockquote>
&nbsp;<b><i>this example shows multiple dependencies:</i></b>
```javascript
var cmd = new Command({
  name: 'cmdProcedure', type: 'Procedure', contents: new Procedure({
    tasks: [
      {
        command: new Command({
          type: 'Function',
          contents: function () {
            var self = this;
            setTimeout(function () {
              self._parentProcedure.bucket += ' rock';
              self.complete();
            }, 300);
          }
        })
      },
      {
        requires: null, // no wait to run this
        label: 'sex',
        command: new Command({
          type: 'Function',
          contents: function () {
            var self = this;
            setTimeout(function () {
              self._parentProcedure.bucket += ' sex';
              self.complete();
            }, 200);
          }
        })
      },
      {
        requires: null, // no wait to run this
        label: 'drugs',
        command: new Command({
          type: 'Function',
          contents: function () {
            var self = this;
            setTimeout(function () {
              self._parentProcedure.bucket += ' drugs';
              self.complete();
            }, 100);
          }
        })
      },
      {
        requires: ['sex', 'drugs', 0], // need these labels and array index 0
        command: new Command({
          type: 'Function',
          contents: function () {
            this._parentProcedure.bucket += ' & roll';
            this.complete();
          }
        })
      }
    ]
  })
});
cmd.onEvent('*', function (event) {
  if (event == 'Completed') callback(cmd.bucket);
});
cmd.bucket = 'todo:';
cmd.execute();
```
<blockquote>returns <strong>todo: drugs sex rock & roll</strong> as expected
</blockquote>
## [&#9664;](#-procedure)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-store) &nbsp;Request
Requests handle the Request / Response design pattern.  They are used by the Interface class to communicate with the Application Model    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Request:</i></b>
```javascript
return new Request('Null') instanceof Request;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
Request('Null'); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>request type must be specified:</i></b>
```javascript
new Request();
```
<blockquote><strong>Error: Request type required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>simple string parameter creates request of named type:</i></b>
```javascript
return new Request('example').type;
```
<blockquote>returns <strong>example</strong> as expected
</blockquote>
&nbsp;<b><i>type can be specified when object passed:</i></b>
```javascript
return new Request({type: 'example'}).type;
```
<blockquote>returns <strong>example</strong> as expected
</blockquote>
&nbsp;<b><i>Command type requests expect contents to contain a command object:</i></b>
```javascript
return new Request({type: 'Command'});
```
<blockquote><strong>Error: command object required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>correct version:</i></b>
```javascript
return new Request({type: 'Command', command: new Command()});
```
<blockquote>returns <strong>Command Request: Stub Command: a command</strong> as expected
</blockquote>
#### METHODS
#### toString()
&nbsp;<b><i>should return a description of the Request:</i></b>
```javascript
return new Request('Null').toString();
```
<blockquote>returns <strong>Null Request</strong> as expected
</blockquote>
## [&#9664;](#-request)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-text) &nbsp;Store
The store class is used for object persistence.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Store:</i></b>
```javascript
return new SurrogateStore() instanceof Store;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
SurrogateStore(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure properties are valid:</i></b>
```javascript
new SurrogateStore({food: 'twinkies'});
```
<blockquote><strong>Error: error creating Store: invalid property: food</strong> thrown as expected
</blockquote>
#### PROPERTIES
#### name
&nbsp;<b><i>name of store can be set in constructor:</i></b>
```javascript
return new SurrogateStore({name: 'punchedCards'}).name;
```
<blockquote>returns <strong>punchedCards</strong> as expected
</blockquote>
#### storeType
storeType defaults to Store Class Name but can be set to suite the app architecture.    

&nbsp;<b><i>storeType can be set in constructor:</i></b>
```javascript
return new SurrogateStore({storeType: 'legacyStorage'}).storeType;
```
<blockquote>returns <strong>legacyStorage</strong> as expected
</blockquote>
#### METHODS
&nbsp;<b><i>getServices() returns an object with interface for the Store.:</i></b>
```javascript
this.log(JSON.stringify(services));
this.shouldBeTrue(services instanceof Object);
this.shouldBeTrue(typeof services['isReady'] == 'boolean'); // don't use until
this.shouldBeTrue(typeof services['canGetModel'] == 'boolean'); // define all allowed methods...
this.shouldBeTrue(typeof services['canPutModel'] == 'boolean');
this.shouldBeTrue(typeof services['canDeleteModel'] == 'boolean');
this.shouldBeTrue(typeof services['canGetList'] == 'boolean');
```
<blockquote><strong>log: </strong>{"isReady":false,"canGetModel":false,"canPutModel":false,"canDeleteModel":false,"canGetList":false}<br></blockquote>
#### toString()
&nbsp;<b><i>should return a description of the Store:</i></b>
```javascript
var cStore = new SurrogateStore();
this.log(cStore.toString());
cStore.name = '7-Eleven';
cStore.storeType = 'ConvenienceStore';
this.log(cStore.toString());
return cStore.toString();
```
<blockquote><strong>log: </strong>a Store<br><strong>log: </strong>ConvenienceStore: 7-Eleven<br>returns <strong>ConvenienceStore: 7-Eleven</strong> as expected
</blockquote>
#### onConnect()
&nbsp;<b><i>must pass url string:</i></b>
```javascript
new SurrogateStore().onConnect();
```
<blockquote><strong>Error: argument must a url string</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must pass callback function:</i></b>
```javascript
new SurrogateStore().onConnect("");
```
<blockquote><strong>Error: argument must a callback</strong> thrown as expected
</blockquote>
see integration test for Store    

#### getModel()
&nbsp;<b><i>getModel() is not implemented for virtual class:</i></b>
```javascript
new SurrogateStore().getModel();
```
<blockquote><strong>Error: Store does not provide getModel</strong> thrown as expected
</blockquote>
#### putModel(model)
&nbsp;<b><i>putModel() is not implemented for virtual class:</i></b>
```javascript
new SurrogateStore().putModel();
```
<blockquote><strong>Error: Store does not provide putModel</strong> thrown as expected
</blockquote>
#### deleteModel(model)
&nbsp;<b><i>deleteModel() is not implemented for virtual class:</i></b>
```javascript
new SurrogateStore().deleteModel();
```
<blockquote><strong>Error: Store does not provide deleteModel</strong> thrown as expected
</blockquote>
#### getList(model, filter, order)
This method will clear and populate the list with collection from store.  The **filter** property can be used to query the store.  The **order** property can specify the sort order of the list.  _See integration test for more info._    

#### Store Integration
&nbsp;<b><i>Check each type:</i></b>
```javascript
var self = this;
spec.integrationStore = new SurrogateStore();
// If store is not ready then get out...
if (!spec.integrationStore.getServices().isReady) {
  self.log('Store is not ready.');
  callback(true);
  return;
}
self.Types = function (args) {
  Model.call(this, args);
  this.modelType = "_tempTypes";
  this.attributes.push(new Attribute({name: 'String', type: 'String', value: 'cheese'}));
  this.attributes.push(new Attribute({name: 'Date', type: 'Date', value: new Date()}));
  this.attributes.push(new Attribute({name: 'Boolean', type: 'Boolean', value: true}));
  this.attributes.push(new Attribute({name: 'Number', type: 'Number', value: 42}));
};
self.Types.prototype = Object.create(Model.prototype);
self.types = new self.Types();
self.types2 = new self.Types();
self.types2.copy(self.types);
spec.integrationStore.putModel(self.types, function (model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('String') == self.types2.get('String'));
  self.shouldBeTrue(model.get('Date') == self.types2.get('Date'));
  self.shouldBeTrue(model.get('Date') instanceof Date);
  self.shouldBeTrue(model.get('Boolean') == self.types2.get('Boolean'));
  self.shouldBeTrue(model.get('Number') == self.types2.get('Number'));
  callback(true);
});
```
<blockquote><strong>log: </strong>Store is not ready.<br>returns <strong>true</strong> as expected
</blockquote>
#### CRUD (Create Read Update Delete)
&nbsp;<b><i>Exercise all store function for one store.:</i></b>
```javascript
var self = this;
spec.integrationStore = new SurrogateStore();
var storeBeingTested = spec.integrationStore.name + ' ' + spec.integrationStore.storeType;
self.log(storeBeingTested);
// If store is not ready then get out...
if (!spec.integrationStore.getServices().isReady) {
  self.log('Store is not ready.');
  callback(true);
  return;
}
// setup stooge class
self.Stooge = function (args) {
  Model.call(this, args);
  this.modelType = "_tempTest_Stooge";
  this.attributes.push(new Attribute('name'));
};
self.Stooge.prototype = inheritPrototype(Model.prototype);
// create initial stooges
self.moe = new self.Stooge();
self.moe.set('name', 'Moe');
self.larry = new self.Stooge();
self.larry.set('name', 'Larry');
self.shemp = new self.Stooge();
self.shemp.set('name', 'Shemp');
// IDs after stored will be here
self.stoogeIDsStored = [];
self.stoogesRetrieved = [];
self.oldStoogesFound = 0;
self.oldStoogesKilled = 0;
// Make sure store starts in known state.  Stores such as mongoStore will retain test values.
// So... use getList to get all stooges then delete them from the Store
var useListToCleanStart = spec.integrationStore.getServices().canGetList;
if (useListToCleanStart) {
  var list = new List(new self.Stooge());
  try {
    self.killhim = new self.Stooge();
    spec.integrationStore.getList(list, [], function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      if (list._items.length < 1)
        storeStooges();
      else
        self.oldStoogesFound = list._items.length;
      for (var i = 0; i < list._items.length; i++) {
        self.killhim.set('id', list._items[i][0]);
        /* jshint ignore:start */
        spec.integrationStore.deleteModel(self.killhim, function (model, error) {
          if (++self.oldStoogesKilled >= self.oldStoogesFound) {
            storeStooges();
          }
        })
        /* jshint ignore:end */
      }
    });
  }
  catch (err) {
    callback(err);
  }
} else {
  storeStooges();
}
// callback to store new stooges
function storeStooges() {
  self.log(self.oldStoogesFound);
  self.log(self.oldStoogesKilled);
  spec.integrationStore.putModel(self.moe, stoogeStored);
  spec.integrationStore.putModel(self.larry, stoogeStored);
  spec.integrationStore.putModel(self.shemp, stoogeStored);
}
// callback after storing stooges
function stoogeStored(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  try {
    self.stoogeIDsStored.push(model.get('id'));
    if (self.stoogeIDsStored.length == 3) {
      self.shouldBeTrue(true, 'here');
      // Now that first 3 stooges are stored lets retrieve and verify
      var actors = [];
      for (var i = 0; i < 3; i++) {
        actors.push(new self.Stooge());
        actors[i].set('id', self.stoogeIDsStored[i]);
        spec.integrationStore.getModel(actors[i], stoogeRetrieved);
      }
    }
  }
  catch (err) {
    callback(err);
  }
}
// callback after retrieving stored stooges
function stoogeRetrieved(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.stoogesRetrieved.push(model);
  if (self.stoogesRetrieved.length == 3) {
    self.shouldBeTrue(true, 'here');
    // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
    self.shouldBeTrue(self.stoogesRetrieved[0] !== self.moe && // Make sure not a reference but a copy
      self.stoogesRetrieved[0] !== self.larry && self.stoogesRetrieved[0] !== self.shemp, 'copy');
    var s = []; // get list of names to see if all stooges made it
    for (var i = 0; i < 3; i++) s.push(self.stoogesRetrieved[i].get('name'));
    self.log(s);
    self.shouldBeTrue(contains(s, 'Moe') && contains(s, 'Larry') && contains(s, 'Shemp'));
    // Replace Shemp with Curly
    var didPutCurly = false;
    for (i = 0; i < 3; i++) {
      if (self.stoogesRetrieved[i].get('name') == 'Shemp') {
        didPutCurly = true;
        self.stoogesRetrieved[i].set('name', 'Curly');
        try {
          spec.integrationStore.putModel(self.stoogesRetrieved[i], stoogeChanged);
        }
        catch (err) {
          callback(err);
        }
      }
    }
    if (!didPutCurly) {
      callback(Error("Can't find Shemp!"));
    }
  }
}
// callback after storing changed stooge
function stoogeChanged(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('name') == 'Curly', 'Curly');
  var curly = new self.Stooge();
  curly.set('id', model.get('id'));
  try {
    spec.integrationStore.getModel(curly, storeChangedShempToCurly);
  }
  catch (err) {
    callback(err);
  }
}
// callback after retrieving changed stooge
function storeChangedShempToCurly(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('name') == 'Curly', 'Curly');
  // Now test delete
  self.deletedModelId = model.get('id'); // Remember this
  spec.integrationStore.deleteModel(model, stoogeDeleted);
}
// callback when Curly is deleted
function stoogeDeleted(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  // model parameter is what was deleted
  self.shouldBeTrue(undefined === model.get('id')); // ID removed
  self.shouldBeTrue(model.get('name') == 'Curly'); // the rest remains
  // Is it really dead?
  var curly = new self.Stooge();
  curly.set('id', self.deletedModelId);
  spec.integrationStore.getModel(curly, hesDeadJim);
}
// callback after lookup of dead stooge
function hesDeadJim(model, error) {
  if (typeof error != 'undefined') {
    if ((error != 'Error: id not found in store') && (error != 'Error: model not found in store')) {
      callback(error);
      return;
    }
  } else {
    callback(Error('no error deleting stooge when expected'));
    return;
  }
  // Skip List test if subclass can't do
  if (!spec.integrationStore.getServices().canGetList) {
    callback(true);
  } else {
    // Now create a list from the stooge store
    var list = new List(new self.Stooge());
    try {
      spec.integrationStore.getList(list, {}, {name: 1}, listReady);
    }
    catch (err) {
      callback(err);
    }
  }
}
// callback after list created from store
function listReady(list, error) {
//          list.sort({name:1});
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(list instanceof List, 'is list');
  self.shouldBeTrue(list.length() == 2, 'is 2');
  list.moveFirst();
  self.shouldBeTrue(list.get('name') == 'Larry', 'larry');
  list.moveNext();
  self.shouldBeTrue(list.get('name') == 'Moe', 'moe');
  callback(true);
}
```
<blockquote><strong>log: </strong>a Store Store<br><strong>log: </strong>Store is not ready.<br>returns <strong>true</strong> as expected
</blockquote>
## [&#9664;](#-store)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-transport) &nbsp;Text
#### Text Class
Text is used to allow display and setting of application / user text.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Text:</i></b>
```javascript
return new Text('Null') instanceof Text;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
Text('Null'); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
#### METHODS
#### toString()
&nbsp;<b><i>should return a description of the Text:</i></b>
```javascript
return new Text('me').toString();
```
<blockquote>returns <strong>Text: 'me'</strong> as expected
</blockquote>
#### get()
&nbsp;<b><i>return value:</i></b>
```javascript
return new Text('yo').get();
```
<blockquote>returns <strong>yo</strong> as expected
</blockquote>
#### set()
&nbsp;<b><i>set value:</i></b>
```javascript
var who = new Text('Me');
who.set('You');
return who.get();
```
<blockquote>returns <strong>You</strong> as expected
</blockquote>
#### onEvent
Use onEvent(events,callback)    

&nbsp;<b><i>first parameter is a string or array of event subscriptions:</i></b>
```javascript
new Text('').onEvent();
```
<blockquote><strong>Error: subscription string or array required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback is required:</i></b>
```javascript
new Text('').onEvent([]);
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>events are checked against known types:</i></b>
```javascript
new Text('').onEvent(['onDrunk'], function () {
});
```
<blockquote><strong>Error: Unknown command event: onDrunk</strong> thrown as expected
</blockquote>
&nbsp;<b><i>here is a working version:</i></b>
```javascript
new Text('').onEvent(['StateChange'], function () {
});
```
#### offEvents
Free all onEvent listeners    

&nbsp;<b><i>example:</i></b>
```javascript
new Text('').offEvent();
```
## [&#9664;](#-text)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-replinterface) &nbsp;Transport
Handle message passing between host and UI.    

TODO: run these tests in node-make-spec-md with io defined    

Read the source until then...    

https://github.com/tgi-io/tgi-core/blob/master/lib/core/tgi-core-transport.spec.js    


## [&#9664;](#-transport)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-application) &nbsp;REPLInterface
#### REPLInterface
The REPLInterface is a Read Evaluate Print Loop Interface.    

#### CONSTRUCTOR
TODO: //spec.runnerInterfaceConstructor(REPLInterface);    

TODO: //spec.runnerInterfaceMethods(REPLInterface);    

#### METHODS
The REPLInterface defines adds the following methods.    

evaluateInput(line)    

&nbsp;<b><i>called when line of input available:</i></b>
```javascript
return typeof REPLInterface.prototype.evaluateInput;
```
<blockquote>returns <strong>function</strong> as expected
</blockquote>
&nbsp;<b><i>if no input state error generated:</i></b>
```javascript

```
captureOutput(callback)    

&nbsp;<b><i>called when line of input available:</i></b>
```javascript
return typeof REPLInterface.prototype.captureOutput;
```
<blockquote>returns <strong>function</strong> as expected
</blockquote>
capturePrompt(callback)    

&nbsp;<b><i>called when line of input available:</i></b>
```javascript
return typeof REPLInterface.prototype.capturePrompt;
```
<blockquote>returns <strong>function</strong> as expected
</blockquote>
#### INTEGRATION
&nbsp;<b><i>user queries:</i></b>
```javascript
var repl = new REPLInterface();
var app = new Application({interface: repl});
var ex = this;
repl.captureOutput(function (text) {
  ex.log('out> ' + text);
  //console.log('out> ' + text);
});
repl.evaluateInput('input ignored if no context for it');
var input = function (text) {
  ex.log('in> ' + text);
  //console.log('in> ' + text);
  repl.evaluateInput(text);
};
/**
 * test per function
 */
var ok1 = function () {
  app.ok('This is a test.', function () {
    yesno1();
  });
  input('whatever');
};
var yesno1 = function () {
  app.yesno('Are we having fun?', function (answer) {
    if (answer) {
      callback(answer);
    } else {
      yesno2();
    }
  });
  input('nope'); // this will be ignored
  input('n'); // this will be ignored
};
var yesno2 = function () {
  app.yesno('Should I continue?', function (answer) {
    if (answer) {
      ask1();
    } else {
      callback(answer);
    }
  });
  input('yeppers'); // this will be ignored
  input('y');
};
var ask1 = function () {
  app.ask('What is your name?', function (answer) {
    repl.info('Nice to meet you ' + answer + '.');
    if (answer == 'Sean') {
      choose1();
    } else {
      callback(answer);
    }
  });
  input('Sean');
};
var choose1 = function () {
  app.choose('Pick one...', ['Eenie', 'Meenie', 'Miney', 'Moe'], function (choice) {
    if (choice == 1)
      callback('done');
    else
      callback(choice);
  });
  input('m'); // first partial match
};
/**
 * Start the first test
 */
ok1();
```
<blockquote><strong>log: </strong>out> input ignored: input ignored if no context for it<br><strong>log: </strong>out> This is a test.<br><strong>log: </strong>in> whatever<br><strong>log: </strong>in> nope<br><strong>log: </strong>out> yes or no response required<br><strong>log: </strong>in> n<br><strong>log: </strong>in> yeppers<br><strong>log: </strong>out> yes or no response required<br><strong>log: </strong>in> y<br><strong>log: </strong>in> Sean<br><strong>log: </strong>out> Nice to meet you Sean.<br><strong>log: </strong>out> Pick one...<br><strong>log: </strong>out>   Eenie<br><strong>log: </strong>out>   Meenie<br><strong>log: </strong>out>   Miney<br><strong>log: </strong>out>   Moe<br><strong>log: </strong>in> m<br>returns <strong>done</strong> as expected
</blockquote>
&nbsp;<b><i>app navigation:</i></b>
```javascript
var repl = new REPLInterface();
var app = new Application({interface: repl});
var ex = this;
repl.captureOutput(function (text) {
  ex.log('out> ' + text);
  //console.log('out> ' + text);
});
var input = function (text) {
  ex.log('in> ' + text);
  //console.log('in> ' + text);
  repl.evaluateInput(text);
};
var answer = '';
var rockCommand = new Command({
  name: 'Rock', type: 'Function', contents: function () {
    answer += 'Rock';
  }
});
var paperCommand = new Command({
  name: 'Paper', type: 'Function', contents: function () {
    answer += 'Paper';
  }
});
var scissorsCommand = new Command({
  name: 'Scissors', type: 'Function', contents: function () {
    answer += 'Scissors';
  }
});
var seeYouCommand = new Command({
  name: 'SeeYou', type: 'Function', contents: function () {
    callback(answer);
  }
});
var menu = new Presentation();
menu.set('name', 'Public Menu');
menu.set('contents', [
  'Strings are ignored',
  new Attribute({name: 'ignoredAlso'}),
  rockCommand,
  paperCommand,
  scissorsCommand,
  seeYouCommand
]);
app.setPresentation(menu);
app.start(function () {
  ex.log('app got stuff: ' + JSON.stringify(stuff));
  //console.log('app got stuff: ' + JSON.stringify(stuff));
});
input('Rockaby');
input('r');
input('p');
input('s');
input('se');
```
<blockquote><strong>log: </strong>in> Rockaby<br><strong>log: </strong>out> "Rockaby" not valid<br><strong>log: </strong>in> r<br><strong>log: </strong>in> p<br><strong>log: </strong>in> s<br><strong>log: </strong>in> se<br><strong>log: </strong>out> Rock, Paper, Scissors, SeeYou<br><strong>log: </strong>out> Rock, Paper, Scissors, SeeYou<br><strong>log: </strong>out> Rock, Paper, Scissors, SeeYou<br><strong>log: </strong>out> Rock, Paper, Scissors, SeeYou<br><strong>log: </strong>out> Rock, Paper, Scissors, SeeYou<br><strong>log: </strong>out> Rock, Paper, Scissors, SeeYou<br>returns <strong>RockPaperScissors</strong> as expected
</blockquote>

## [&#9664;](#-replinterface)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-log) &nbsp;Application
#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Application:</i></b>
```javascript
return new Application() instanceof Application;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
*29 model tests applied*    

&nbsp;<b><i>argument property interface will invoke setInterface method:</i></b>
```javascript
var myInterface = new Interface();
var myApplication = new Application({interface: myInterface});
return (myApplication.getInterface() === myInterface);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### ATTRIBUTES
Application extends model and inherits the attributes property.  All Application objects have the following attributes:    

&nbsp;<b><i>following attributes are defined::</i></b>
```javascript
var presentation = new Application(); // default attributes and values
this.shouldBeTrue(presentation.get('name') === 'newApp');
this.shouldBeTrue(presentation.get('brand') === 'NEW APP');
```
#### METHODS
#### setInterface(interface)
Setting the interface for the application determines the primary method of user interaction.    

&nbsp;<b><i>must supply Interface object:</i></b>
```javascript
new Application().setInterface();
```
<blockquote><strong>Error: instance of Interface a required parameter</strong> thrown as expected
</blockquote>
#### getInterface()
returns primary user interface for application    

&nbsp;<b><i>default is undefined:</i></b>
```javascript
return new Application().getInterface() === undefined;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>returns value set by set Interface:</i></b>
```javascript
var myInterface = new Interface();
var myApplication = new Application();
myApplication.setInterface(myInterface);
return (myApplication.getInterface() === myInterface);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### setPresentation(presentation)
Setting the presentation for the application determines the primary commands available to the user.    

&nbsp;<b><i>must supply Presentation object:</i></b>
```javascript
new Application().setPresentation();
```
<blockquote><strong>Error: instance of Presentation a required parameter</strong> thrown as expected
</blockquote>
#### getPresentation()
returns primary user presentation for application    

&nbsp;<b><i>default is undefined:</i></b>
```javascript
return new Application().getPresentation() === undefined;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>returns value set by set Presentation:</i></b>
```javascript
var myPresentation = new Presentation();
var myApplication = new Application();
myApplication.setPresentation(myPresentation);
return (myApplication.getPresentation() === myPresentation);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### start()
The start method executes the application.    

&nbsp;<b><i>must set interface before starting:</i></b>
```javascript
new Application().start();
```
<blockquote><strong>Error: error starting application: interface not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback parameter required:</i></b>
```javascript
new Application({interface: new Interface()}).start();
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
#### dispatch()
The dispatch method will accept a request and act on it or pass it to the app.    

&nbsp;<b><i>must pass a Request object:</i></b>
```javascript
new Application().dispatch();
```
<blockquote><strong>Error: Request required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>send command without callback when no response needed:</i></b>
```javascript
var ex = this;
new Application().dispatch(new Request({
  type: 'Command', command: new Command(function () {
    ex.log('PEACE');
  })
}));
```
<blockquote><strong>log: </strong>PEACE<br></blockquote>
&nbsp;<b><i>optional second parameter is the response callback:</i></b>
```javascript
new Application().dispatch(new Request({type: 'Command', command: new Command()}), true);
```
<blockquote><strong>Error: response callback is not a function</strong> thrown as expected
</blockquote>
#### info(text)
Display info to user in background of primary presentation.    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().info(); // see Interface for more info
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
#### done(text)
Display done to user in background of primary presentation.    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().done(); // see Interface for more info
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
#### warn(text)
Display info to user in background of primary presentation.    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().warn(); // see Interface for more info
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
#### err(text)
Display info to user in background of primary presentation.    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().err(); // see Interface for more info
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
#### ok(prompt, callback)
Pause before proceeding    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().ok();
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide the text prompt param:</i></b>
```javascript
new Application({interface: new Interface()}).ok();
```
<blockquote><strong>Error: prompt required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide callback param:</i></b>
```javascript
new Application({interface: new Interface()}).ok('You are about to enter the twilight zone.');
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
#### yesno(prompt, callback)
Query user with a yes no question.    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().yesno();
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide the text question param:</i></b>
```javascript
new Application({interface: new Interface()}).yesno();
```
<blockquote><strong>Error: prompt required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide callback param:</i></b>
```javascript
new Application({interface: new Interface()}).yesno('ok?');
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
#### ask(prompt, attribute, callback)
Simple single item prompt.    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().ask();
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide the text question param:</i></b>
```javascript
new Application({interface: new Interface()}).ask();
```
<blockquote><strong>Error: prompt required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>next param is attribute or callback:</i></b>
```javascript
new Application({interface: new Interface()}).ask('sup');
```
<blockquote><strong>Error: attribute or callback expected</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide callback param:</i></b>
```javascript
new Application({interface: new Interface()}).
  ask('Please enter your name', new Attribute({name: 'Name'}));
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
#### choose
prompt to choose an item    

&nbsp;<b><i>must set interface before invoking:</i></b>
```javascript
new Application().choose();
```
<blockquote><strong>Error: interface not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must provide text prompt first:</i></b>
```javascript
new Application({interface: new Interface()}).choose();
```
<blockquote><strong>Error: prompt required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must supply array of choices:</i></b>
```javascript
var myApplication = new Application({interface: new Interface()});
this.shouldThrowError(Error('choices array required'), function () {
  myApplication.choose('What it do');
});
this.shouldThrowError(Error('choices array required'), function () {
  myApplication.choose('this will not', 'work');
});
this.shouldThrowError(Error('choices array empty'), function () {
  myApplication.choose('empty array?', []);
});
```
&nbsp;<b><i>must provide callback param:</i></b>
```javascript
var myApplication = new Application();
myApplication.setInterface(new Interface());
myApplication.choose('choose wisely', ['rock', 'paper', 'scissors']);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
#### Application Integration
&nbsp;<b><i>minimal app:</i></b>
```javascript
// Here is our app
var ui = new Interface();
var app = new Application();
app.setInterface(ui);
app.start(console.log);
// define command to satisfy test
var helloWorldCommand = new Command(function () {
  callback('hello world');
});
// mock ui command request - this will get executed by app directly
ui.mockRequest(new Request({type: 'Command', command: helloWorldCommand}));
```
<blockquote>returns <strong>hello world</strong> as expected
</blockquote>
&nbsp;<b><i>little app with command execution mocking:</i></b>
```javascript
// todo delamify this
// Send 4 mocks and make sure we get 4 callback calls
var self = this;
self.callbackCount = 0;
var app = new Application();
var testInterface = new Interface();
var testPresentation = new Presentation();
app.setInterface(testInterface);
app.setPresentation(testPresentation);
app.start(function (request) {
  if (request.type == 'mock count')
    self.callbackCount++;
  if (self.callbackCount > 3)
    callback(true);
});
var cmds = [];
var i;
for (i = 0; i < 4; i++) {
  cmds.push(new Request('mock count'));
}
testInterface.mockRequest(cmds);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
## [&#9664;](#-application)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-presentation) &nbsp;Log
#### Log Model
Multi purpose log model.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Workspace:</i></b>
```javascript
return new Log() instanceof Log;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
*29 model tests applied*    

#### ATTRIBUTES
&nbsp;<b><i>following attributes are defined::</i></b>
```javascript
var log = new Log('what up'); // default attributes and values
this.shouldBeTrue(log.get('id') !== undefined);
this.shouldBeTrue(log.get('dateLogged') instanceof Date);
this.log(log.get('dateLogged'));
this.shouldBeTrue(log.get('logType') == 'Text');
this.shouldBeTrue(log.get('importance') == 'Info');
this.shouldBeTrue(log.get('contents') == 'what up');
```
<blockquote><strong>log: </strong>Tue Mar 08 2016 15:08:38 GMT-0500 (EST)<br></blockquote>
#### LOG TYPES
&nbsp;<b><i>must be valid:</i></b>
```javascript
this.log('T.getLogTypes()');
new Log({logType: 'wood'}); // default attributes and values
```
<blockquote><strong>log: </strong>T.getLogTypes()<br><strong>Error: Unknown log type: wood</strong> thrown as expected
</blockquote>
&nbsp;<b><i>Text simple text message:</i></b>
```javascript
return new Log('sup');
```
<blockquote>returns <strong>Info: sup</strong> as expected
</blockquote>
&nbsp;<b><i>Delta logged Delta (see in Core):</i></b>
```javascript
var delta = new Delta(new Attribute.ModelID(new Model()));
return new Log({logType: 'Delta', contents: delta}).toString();
```
<blockquote>returns <strong>Info: (delta)</strong> as expected
</blockquote>
## [&#9664;](#-log)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-session) &nbsp;Presentation
#### Presentation Model
The Presentation Model represents the way in which a model is to be presented to the user.  The specific Interface object will represent the model data according to the Presentation object.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Presentation:</i></b>
```javascript
return new Presentation() instanceof Presentation;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
*29 model tests applied*    

#### PROPERTIES
#### model
This is a model instance for the presentation instance.    

#### validationErrors
&nbsp;<b><i>Array of errors:</i></b>
```javascript
this.shouldBeTrue(new Presentation().validationErrors instanceof Array);
this.shouldBeTrue(new Presentation().validationErrors.length === 0);
```
#### validationMessage
&nbsp;<b><i>string description of error(s):</i></b>
```javascript
return new Presentation().validationMessage;
```
#### preRenderCallback
preRenderCallback can be set to prepare presentation prior to Interface render    

#### ATTRIBUTES
Presentation extends model and inherits the attributes property.  All Presentation objects have the following attributes:    

&nbsp;<b><i>following attributes are defined::</i></b>
```javascript
var presentation = new Presentation(); // default attributes and values
this.shouldBeTrue(presentation.get('id') === null);
this.shouldBeTrue(presentation.get('name') === null);
this.shouldBeTrue(presentation.get('modelName') === null);
this.shouldBeTrue(presentation.get('contents') instanceof Array);
```
#### METHODS
#### modelConstructor
This is a reference to the constructor function to create a new model    

#### validate
check valid object state then extend to presentation contents    

&nbsp;<b><i>callback is required -- see integration:</i></b>
```javascript
new Presentation().validate();
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
#### CONTENTS
The contents attributes provides the structure for the presentation.    

&nbsp;<b><i>content must be an array:</i></b>
```javascript
var pres = new Presentation();
pres.set('contents', true);
return pres.getObjectStateErrors();
```
<blockquote>returns <strong>contents must be Array</strong> as expected
</blockquote>
&nbsp;<b><i>contents elements must be Text, Command, Attribute, List or string:</i></b>
```javascript
var pres = new Presentation();
// strings with prefix # are heading, a dash - by itself is for a visual separator
pres.set('contents', ['#heading', new Text('sup'), new Command(), new Attribute({name: 'meh'}), new List(new Model())]);
this.shouldBeTrue(pres.getObjectStateErrors().length === 0);
pres.set('contents', [new Command(), new Attribute({name: 'meh'}), true]);
return pres.getObjectStateErrors();
```
<blockquote>returns <strong>contents elements must be Text, Command, Attribute, List or string</strong> as expected
</blockquote>
#### INTEGRATION
&nbsp;<b><i>validation usage demonstrated:</i></b>
```javascript
var attribute = new Attribute({name: 'test'});
var presentation = new Presentation(); // default attributes and values
presentation.set('contents', [attribute]);
attribute.setError('test', 'test error');
presentation.validate(function () {
  callback(presentation.validationMessage);
});
```
<blockquote>returns <strong>contents has validation errors</strong> as expected
</blockquote>
&nbsp;<b><i>use REPLInterface to view and edit:</i></b>
```javascript
var repl = new REPLInterface();
var ex = this;
repl.captureOutput(function (text) {
  ex.log('out> ' + text);
  //console.log('out> ' + text);
});
repl.capturePrompt(function (text) {
  ex.log('prompt> ' + text);
  //console.log('prompt> ' + text);
});
var input = function (text) {
  ex.log('in> ' + text);
  //console.log('in> ' + text);
  repl.evaluateInput(text);
};
/**
 * Here is the presentation
 */
var firstName = new Attribute({name: 'firstName'});
var lastName = new Attribute({name: 'lastName'});
var presentation = new Presentation();
presentation.set('contents', [
  '##TITLE',
  'Here is **text**.  _Note it uses markdown_.  Eventually this will be **stripped** out!',
  'Here are some attributes:',
  firstName,
  lastName
]);
firstName.value = 'Elmer';
lastName.value = 'Fud';
/**
 * Create a command to view it (default mode)
 */
var presentationCommand = new Command({name: 'Presentation', type: 'Presentation', contents: presentation});
presentationCommand.onEvent('*', function (event, err) {
  var eventDesc = 'event> ' + event + (err || ' ok');
  ex.log(eventDesc);
  //console.log(eventDesc);
});
presentationCommand.execute(repl);
/**
 * Now edit it
 */
presentationCommand.presentationMode = 'Edit';
presentationCommand.execute(repl);
input('John');
input('Doe');
/**
 * View again
 */
presentationCommand.presentationMode = 'View';
presentationCommand.execute(repl);
```
<blockquote><strong>log: </strong>event> BeforeExecute ok<br><strong>log: </strong>event> ErrorError: Presentation object required<br><strong>log: </strong>event> Completed ok<br><strong>log: </strong>event> AfterExecute ok<br><strong>log: </strong>event> BeforeExecute ok<br><strong>log: </strong>event> ErrorError: Presentation object required<br><strong>log: </strong>event> Completed ok<br><strong>log: </strong>event> AfterExecute ok<br><strong>log: </strong>in> John<br><strong>log: </strong>out> input ignored: John<br><strong>log: </strong>in> Doe<br><strong>log: </strong>out> input ignored: Doe<br><strong>log: </strong>event> BeforeExecute ok<br><strong>log: </strong>event> ErrorError: Presentation object required<br><strong>log: </strong>event> Completed ok<br><strong>log: </strong>event> AfterExecute ok<br><strong>log: </strong>prompt> ?<br><strong>log: </strong>prompt> ?<br></blockquote>
## [&#9664;](#-presentation)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-user) &nbsp;Session
#### Session Model
The Session Model represents the Session logged into the system. The library uses this for system access, logging and other functions.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Session:</i></b>
```javascript
return new Session() instanceof Session;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### CONSTRUCTOR
Creation of all Models must adhere to following examples:    

&nbsp;<b><i>objects created should be an instance of Model:</i></b>
```javascript
return new SurrogateModel() instanceof Model;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
SurrogateModel(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure properties are valid:</i></b>
```javascript
new SurrogateModel({sup: 'yo'});
```
<blockquote><strong>Error: error creating Model: invalid property: sup</strong> thrown as expected
</blockquote>
&nbsp;<b><i>can supply attributes in constructor in addition to ID default:</i></b>
```javascript
var play = new SurrogateModel({attributes: [new Attribute('game')]});
play.set('game', 'scrabble'); // this would throw error if attribute did not exist
return play.get('game');
```
<blockquote>returns <strong>scrabble</strong> as expected
</blockquote>
#### PROPERTIES
#### tags
Tags are an array of strings that can be used in searching.    

&nbsp;<b><i>should be an array or undefined:</i></b>
```javascript
var m = new SurrogateModel(); // default is undefined
this.shouldBeTrue(m.tag === undefined && m.getObjectStateErrors().length === 0);
m.tags = [];
this.shouldBeTrue(m.getObjectStateErrors().length === 0);
m.tags = 'your it';
this.shouldBeTrue(m.getObjectStateErrors().length == 1);
```
#### attributes
The attributes property is an array of Attributes.    

&nbsp;<b><i>should be an array:</i></b>
```javascript
var goodModel = new SurrogateModel(), badModel = new SurrogateModel();
badModel.attributes = 'wtf';
return (goodModel.getObjectStateErrors().length === 0 && badModel.getObjectStateErrors().length == 1);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>elements of array must be instance of Attribute:</i></b>
```javascript
// passing true to getObjectStateErrors() means only check model and not subclass validations
// todo make unit test for above
var model = new SurrogateModel();
model.attributes = [new Attribute("ID", "ID")];
this.shouldBeTrue(model.getObjectStateErrors(true).length === 0);
model.attributes = [new Attribute("ID", "ID"), new SurrogateModel(), 0, 'a', {}, [], null];
this.shouldBeTrue(model.getObjectStateErrors(true).length == 6);
```
#### METHODS
#### toString()
&nbsp;<b><i>should return a description of the model:</i></b>
```javascript
return new SurrogateModel().toString().length > 0;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### copy(sourceModel)
&nbsp;<b><i>copy all attribute values of a model:</i></b>
```javascript
var Foo = function (args) {
  Model.call(this, args);
  this.modelType = "Foo";
  this.attributes.push(new Attribute('name'));
};
Foo.prototype = inheritPrototype(Model.prototype);
var m1 = new Foo();
var m2 = new Foo();
var m3 = m1;
m1.set('name', 'Bar');
m2.set('name', 'Bar');
// First demonstrate instance ref versus another model with equal attributes
this.shouldBeTrue(m1 === m3); // assigning one model to variable references same instance
this.shouldBeTrue(m3.get('name') === 'Bar'); // m3 changed when m1 changed
this.shouldBeTrue(m1 !== m2); // 2 models are not the same instance
this.shouldBeTrue(JSON.stringify(m1) === JSON.stringify(m2)); // but they are identical
// clone m1 into m4 and demonstrate that contents equal but not same ref to object
var m4 = new Foo();
m4.copy(m1);
this.shouldBeTrue(m1 !== m4); // 2 models are not the same instance
this.shouldBeTrue(JSON.stringify(m1) === JSON.stringify(m4)); // but they are identical
```
#### getObjectStateErrors()
&nbsp;<b><i>should return array of validation errors:</i></b>
```javascript
this.shouldBeTrue(new SurrogateModel().getObjectStateErrors() instanceof Array);
```
&nbsp;<b><i>first attribute must be an ID field:</i></b>
```javascript
var m = new SurrogateModel();
m.attributes = [new Attribute('spoon')];
return m.getObjectStateErrors();
```
<blockquote>returns <strong>first attribute must be ID</strong> as expected
</blockquote>
#### onEvent
Use onEvent(events,callback)    

&nbsp;<b><i>first parameter is a string or array of event subscriptions:</i></b>
```javascript
new SurrogateModel().onEvent();
```
<blockquote><strong>Error: subscription string or array required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback is required:</i></b>
```javascript
new SurrogateModel().onEvent([]);
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>events are checked against known types:</i></b>
```javascript
new SurrogateModel().onEvent(['onDrunk'], function () {
});
```
<blockquote><strong>Error: Unknown command event: onDrunk</strong> thrown as expected
</blockquote>
&nbsp;<b><i>here is a working version:</i></b>
```javascript
this.log('T.getAttributeEvents()');
// Validate - callback when attribute needs to be validated
// StateChange -- callback when state of object (value or validation state) has changed
new Model().onEvent(['Validate'], function () {
});
```
<blockquote><strong>log: </strong>T.getAttributeEvents()<br></blockquote>
#### attribute
&nbsp;<b><i>return attribute by name:</i></b>
```javascript
var attrib = new Attribute("Sue");
var model = new Model({attributes: [attrib]});
return model.attribute("Sue") == attrib;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### getShortName
&nbsp;<b><i>returns short description of model, defaults to first string attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('name')]});
question.attributes[1].value = 'Shorty';
return question.getShortName();
```
<blockquote>returns <strong>Shorty</strong> as expected
</blockquote>
&nbsp;<b><i>if no string attribute found empty string returned:</i></b>
```javascript
// Test for model since models may provide attributes to fail this test
var question = new Model({attributes: [new Attribute('answer', 'Number')]});
question.attributes[1].value = 42;
return question.getShortName();
```
#### getLongName
note - both getShortName and getLongName should be overriden with method returning desired results when needed.    

&nbsp;<b><i>return a more verbose name for model than getShortName:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('name')]});
question.attributes[1].value = 'Shorty';
return question.getLongName();
```
<blockquote>returns <strong>Shorty</strong> as expected
</blockquote>
#### get(attributeName)
&nbsp;<b><i>returns undefined if the attribute does not exist:</i></b>
```javascript
this.shouldBeTrue(new SurrogateModel().get('whatever') === undefined);
```
&nbsp;<b><i>returns the value for given attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('answer', 'Number')]});
question.attributes[1].value = 42;
return question.get('answer');
```
<blockquote>returns <strong>42</strong> as expected
</blockquote>
#### getAttributeType(attributeName)
&nbsp;<b><i>returns attribute type for given attribute name:</i></b>
```javascript
return new SurrogateModel({attributes: [new Attribute('born', 'Date')]}).getAttributeType('born');
```
<blockquote>returns <strong>Date</strong> as expected
</blockquote>
#### set(attributeName,value)
&nbsp;<b><i>throws an error if the attribute does not exists:</i></b>
```javascript
new SurrogateModel().set('whatever');
```
<blockquote><strong>Error: attribute not valid for model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>sets the value for given attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('answer', 'Number')]});
question.set('answer', 42);
return question.attributes[1].value;
```
<blockquote>returns <strong>42</strong> as expected
</blockquote>
#### validate
check valid object state and value for attribute - invoke callback for results    

&nbsp;<b><i>callback is required:</i></b>
```javascript
new Model().validate();
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
#### setError
Set a error condition and descriptive message    

&nbsp;<b><i>first argument condition required:</i></b>
```javascript
new Model().setError();
```
<blockquote><strong>Error: condition required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>second argument description required:</i></b>
```javascript
new Model().setError('login');
```
<blockquote><strong>Error: description required</strong> thrown as expected
</blockquote>
#### clearError
Clear a error condition    

&nbsp;<b><i>first argument condition required:</i></b>
```javascript
new Model().clearError();
```
<blockquote><strong>Error: condition required</strong> thrown as expected
</blockquote>
#### INTEGRATION
&nbsp;<b><i>model validation usage demonstrated:</i></b>
```javascript
// Create a model with each attribute having and error
var model = new Model({
  attributes: [
    new Attribute({name: 'Name', validationRule: {required: true}}),
    new Attribute({name: 'Age', type: 'Number', validationRule: {range: [18, null]}}),
    new Attribute({name: 'Sex', validationRule: {required: true}})
  ]
});
model.setError('danger', 'Danger Will Robinson');
// Create a model validation where males have to be 21
model.onEvent('Validate', function () {
  var name = model.get('name');
  var age = model.get('age');
  var sex = model.get('sex');
  if (sex != 'F' && age < 21)
    model.validationErrors.push('Males must be 21 or over');
});
model.validate(test1);
// Expect 1 error from B9 Robot (Attribute errors ignored if model state error)
function test1() {
  if (model.validationErrors.length == 1) {
    model.clearError('danger');
    model.validate(test2);
  } else {
    callback('test1: ' + model.validationErrors.length);
  }
}
// Expect 3 errors for each attribute
function test2() {
  if (model.validationErrors.length == 3) {
    model.set('name', 'John Doe');
    model.set('age', 18);
    model.set('sex', 'M');
    model.validate(test3);
  } else {
    callback('test2: ' + model.validationErrors.length);
  }
}
// Expect 1 errors since all attributes fixed but model will fail
function test3() {
  if (model.validationErrors.length == 1 && model.validationMessage == 'Males must be 21 or over') {
    model.set('age', 21);
    model.validate(test4);
  } else {
    callback('test3: ' + model.validationErrors.length);
  }
}
// Test done should be no errors (to pass final test)
function test4() {
  callback('test4: ' + model.validationErrors.length);
}
```
<blockquote>returns <strong>test4: 0</strong> as expected
</blockquote>
*29 model tests applied*    

#### ATTRIBUTES
&nbsp;<b><i>following attributes are defined::</i></b>
```javascript
var session = new Session(); // default attributes and values
this.shouldBeTrue(session.get('id') === null);
this.shouldBeTrue(session.get('userID') instanceof Attribute.ModelID);
this.shouldBeTrue(session.get('userID').modelType == 'User');
this.shouldBeTrue(session.get('dateStarted') instanceof Date);
this.shouldBeTrue(session.get('passCode') === null);
this.shouldBeTrue(session.get('ipAddress') === null);
this.shouldBeTrue(session.get('active') === false);
```
#### METHODS
#### startSession()
This method will create a new session record for a user.    

&nbsp;<b><i>parameters are store, user, password, IP and callback:</i></b>
```javascript
this.shouldThrowError(Error('store required'), function () {
  new Session().startSession();
});
this.shouldThrowError(Error('userName required'), function () {
  new Session().startSession(new Store());
});
this.shouldThrowError(Error('password required'), function () {
  new Session().startSession(new Store(), 'blow');
});
this.shouldThrowError(Error('ip required'), function () {
  new Session().startSession(new Store(), 'blow', 'me');
});
this.shouldThrowError(Error('callback required'), function () {
  new Session().startSession(new Store(), 'blow', 'me', 'ipman');
});
```
#### resumeSession()
This method will resume an existing session.    

&nbsp;<b><i>parameters are store, IP, passcode and callback:</i></b>
```javascript
this.shouldThrowError(Error('store required'), function () {
  new Session().resumeSession();
});
this.shouldThrowError(Error('ip required'), function () {
  new Session().resumeSession(new Store());
});
this.shouldThrowError(Error('passCode required'), function () {
  new Session().resumeSession(new Store(), 'ipman');
});
this.shouldThrowError(Error('callback required'), function () {
  new Session().resumeSession(new Store(), 'ipman', '123');
});
```
#### endSession()
Method to end session.    

&nbsp;<b><i>parameters are store and callback - session object should be in memory:</i></b>
```javascript
this.shouldThrowError(Error('store required'), function () {
  new Session().endSession();
});
this.shouldThrowError(Error('callback required'), function () {
  new Session().endSession(new Store());
});
```
#### INTEGRATION TEST
&nbsp;<b><i>simulate logging in etc:</i></b>
```javascript
var self = this;
var store = new MemoryStore();
var session1 = new Session();
var session2 = new Session();
var user1 = new User(), name1 = 'jack', pass1 = 'wack', ip1 = '123';
user1.set('name', name1);
user1.set('password', pass1);
user1.set('active', true);
var user2 = new User(), name2 = 'jill', pass2 = 'pill', ip2 = '456';
user2.set('name', name2);
user2.set('password', pass2);
user2.set('active', true);
// start with empty store and add some users
store.putModel(user1, userStored);
store.putModel(user2, userStored);
// callback after users stored
function userStored(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  if (user1.get('id') && user2.get('id')) {
    // users added to store now log them both in and also generate 2 errors
    self.goodCount = 0;
    self.badCount = 0;
    session1.startSession(store, name1, 'badpassword', ip1, usersStarted);
    session1.startSession(store, name1, pass1, ip1, usersStarted);
    session2.startSession(store, 'john', pass2, ip2, usersStarted);
    session2.startSession(store, name2, pass2, ip2, usersStarted);
  }
}
// callback after session started called
function usersStarted(err, session) {
  if (err)
    self.badCount++;
  else
    self.goodCount++;
  if (self.badCount == 2 && self.goodCount == 2) {
    // Resume session1 correctly
    new Session().resumeSession(store, ip1, session1.get('passCode'), sessionResumed_Test1);
  }
}
function sessionResumed_Test1(err, session) {
  if (err)
    callback(Error('sessionResumed_Test1 failed'));
  else
  // Resume session2 with wrong passcode
    new Session().resumeSession(store, ip2, 'no more secrets', sessionResumed_Test2);
}
function sessionResumed_Test2(err, session) {
  if (err)
  // Resume session2 correctly now after failing
    new Session().resumeSession(store, ip2, session2.get('passCode'), sessionResumed_Test3);
  else
    callback(Error('sessionResumed_Test2 failed'));
}
function sessionResumed_Test3(err, session) {
  if (err)
    callback(Error('sessionResumed_Test3 failed:  ' + err));
  else
  // Now we end this session
    session.endSession(store, function (err, session) {
      if (err)
        callback(Error('session.endSession failed: '+err));
      else
      // Now try restoring again and it should fail
        new Session().resumeSession(store, ip2, session2.get('passCode'), sessionResumed_Test4);
    });
}
function sessionResumed_Test4(err, session) {
  if (err)
    callback(Error('sessionResumed_Test4 failed'));
  else
    callback(true);
}
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
## [&#9664;](#-session)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-workspace) &nbsp;User
#### User Model
The User Model represents the user logged into the system. The library uses this for system access, logging and other functions.    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of User:</i></b>
```javascript
return new User() instanceof User;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### CONSTRUCTOR
Creation of all Models must adhere to following examples:    

&nbsp;<b><i>objects created should be an instance of Model:</i></b>
```javascript
return new SurrogateModel() instanceof Model;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
SurrogateModel(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure properties are valid:</i></b>
```javascript
new SurrogateModel({sup: 'yo'});
```
<blockquote><strong>Error: error creating Model: invalid property: sup</strong> thrown as expected
</blockquote>
&nbsp;<b><i>can supply attributes in constructor in addition to ID default:</i></b>
```javascript
var play = new SurrogateModel({attributes: [new Attribute('game')]});
play.set('game', 'scrabble'); // this would throw error if attribute did not exist
return play.get('game');
```
<blockquote>returns <strong>scrabble</strong> as expected
</blockquote>
#### PROPERTIES
#### tags
Tags are an array of strings that can be used in searching.    

&nbsp;<b><i>should be an array or undefined:</i></b>
```javascript
var m = new SurrogateModel(); // default is undefined
this.shouldBeTrue(m.tag === undefined && m.getObjectStateErrors().length === 0);
m.tags = [];
this.shouldBeTrue(m.getObjectStateErrors().length === 0);
m.tags = 'your it';
this.shouldBeTrue(m.getObjectStateErrors().length == 1);
```
#### attributes
The attributes property is an array of Attributes.    

&nbsp;<b><i>should be an array:</i></b>
```javascript
var goodModel = new SurrogateModel(), badModel = new SurrogateModel();
badModel.attributes = 'wtf';
return (goodModel.getObjectStateErrors().length === 0 && badModel.getObjectStateErrors().length == 1);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>elements of array must be instance of Attribute:</i></b>
```javascript
// passing true to getObjectStateErrors() means only check model and not subclass validations
// todo make unit test for above
var model = new SurrogateModel();
model.attributes = [new Attribute("ID", "ID")];
this.shouldBeTrue(model.getObjectStateErrors(true).length === 0);
model.attributes = [new Attribute("ID", "ID"), new SurrogateModel(), 0, 'a', {}, [], null];
this.shouldBeTrue(model.getObjectStateErrors(true).length == 6);
```
#### METHODS
#### toString()
&nbsp;<b><i>should return a description of the model:</i></b>
```javascript
return new SurrogateModel().toString().length > 0;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### copy(sourceModel)
&nbsp;<b><i>copy all attribute values of a model:</i></b>
```javascript
var Foo = function (args) {
  Model.call(this, args);
  this.modelType = "Foo";
  this.attributes.push(new Attribute('name'));
};
Foo.prototype = inheritPrototype(Model.prototype);
var m1 = new Foo();
var m2 = new Foo();
var m3 = m1;
m1.set('name', 'Bar');
m2.set('name', 'Bar');
// First demonstrate instance ref versus another model with equal attributes
this.shouldBeTrue(m1 === m3); // assigning one model to variable references same instance
this.shouldBeTrue(m3.get('name') === 'Bar'); // m3 changed when m1 changed
this.shouldBeTrue(m1 !== m2); // 2 models are not the same instance
this.shouldBeTrue(JSON.stringify(m1) === JSON.stringify(m2)); // but they are identical
// clone m1 into m4 and demonstrate that contents equal but not same ref to object
var m4 = new Foo();
m4.copy(m1);
this.shouldBeTrue(m1 !== m4); // 2 models are not the same instance
this.shouldBeTrue(JSON.stringify(m1) === JSON.stringify(m4)); // but they are identical
```
#### getObjectStateErrors()
&nbsp;<b><i>should return array of validation errors:</i></b>
```javascript
this.shouldBeTrue(new SurrogateModel().getObjectStateErrors() instanceof Array);
```
&nbsp;<b><i>first attribute must be an ID field:</i></b>
```javascript
var m = new SurrogateModel();
m.attributes = [new Attribute('spoon')];
return m.getObjectStateErrors();
```
<blockquote>returns <strong>first attribute must be ID</strong> as expected
</blockquote>
#### onEvent
Use onEvent(events,callback)    

&nbsp;<b><i>first parameter is a string or array of event subscriptions:</i></b>
```javascript
new SurrogateModel().onEvent();
```
<blockquote><strong>Error: subscription string or array required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback is required:</i></b>
```javascript
new SurrogateModel().onEvent([]);
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>events are checked against known types:</i></b>
```javascript
new SurrogateModel().onEvent(['onDrunk'], function () {
});
```
<blockquote><strong>Error: Unknown command event: onDrunk</strong> thrown as expected
</blockquote>
&nbsp;<b><i>here is a working version:</i></b>
```javascript
this.log('T.getAttributeEvents()');
// Validate - callback when attribute needs to be validated
// StateChange -- callback when state of object (value or validation state) has changed
new Model().onEvent(['Validate'], function () {
});
```
<blockquote><strong>log: </strong>T.getAttributeEvents()<br></blockquote>
#### attribute
&nbsp;<b><i>return attribute by name:</i></b>
```javascript
var attrib = new Attribute("Sue");
var model = new Model({attributes: [attrib]});
return model.attribute("Sue") == attrib;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### getShortName
&nbsp;<b><i>returns short description of model, defaults to first string attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('name')]});
question.attributes[1].value = 'Shorty';
return question.getShortName();
```
<blockquote>returns <strong>Shorty</strong> as expected
</blockquote>
&nbsp;<b><i>if no string attribute found empty string returned:</i></b>
```javascript
// Test for model since models may provide attributes to fail this test
var question = new Model({attributes: [new Attribute('answer', 'Number')]});
question.attributes[1].value = 42;
return question.getShortName();
```
#### getLongName
note - both getShortName and getLongName should be overriden with method returning desired results when needed.    

&nbsp;<b><i>return a more verbose name for model than getShortName:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('name')]});
question.attributes[1].value = 'Shorty';
return question.getLongName();
```
<blockquote>returns <strong>Shorty</strong> as expected
</blockquote>
#### get(attributeName)
&nbsp;<b><i>returns undefined if the attribute does not exist:</i></b>
```javascript
this.shouldBeTrue(new SurrogateModel().get('whatever') === undefined);
```
&nbsp;<b><i>returns the value for given attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('answer', 'Number')]});
question.attributes[1].value = 42;
return question.get('answer');
```
<blockquote>returns <strong>42</strong> as expected
</blockquote>
#### getAttributeType(attributeName)
&nbsp;<b><i>returns attribute type for given attribute name:</i></b>
```javascript
return new SurrogateModel({attributes: [new Attribute('born', 'Date')]}).getAttributeType('born');
```
<blockquote>returns <strong>Date</strong> as expected
</blockquote>
#### set(attributeName,value)
&nbsp;<b><i>throws an error if the attribute does not exists:</i></b>
```javascript
new SurrogateModel().set('whatever');
```
<blockquote><strong>Error: attribute not valid for model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>sets the value for given attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('answer', 'Number')]});
question.set('answer', 42);
return question.attributes[1].value;
```
<blockquote>returns <strong>42</strong> as expected
</blockquote>
#### validate
check valid object state and value for attribute - invoke callback for results    

&nbsp;<b><i>callback is required:</i></b>
```javascript
new Model().validate();
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
#### setError
Set a error condition and descriptive message    

&nbsp;<b><i>first argument condition required:</i></b>
```javascript
new Model().setError();
```
<blockquote><strong>Error: condition required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>second argument description required:</i></b>
```javascript
new Model().setError('login');
```
<blockquote><strong>Error: description required</strong> thrown as expected
</blockquote>
#### clearError
Clear a error condition    

&nbsp;<b><i>first argument condition required:</i></b>
```javascript
new Model().clearError();
```
<blockquote><strong>Error: condition required</strong> thrown as expected
</blockquote>
#### INTEGRATION
&nbsp;<b><i>model validation usage demonstrated:</i></b>
```javascript
// Create a model with each attribute having and error
var model = new Model({
  attributes: [
    new Attribute({name: 'Name', validationRule: {required: true}}),
    new Attribute({name: 'Age', type: 'Number', validationRule: {range: [18, null]}}),
    new Attribute({name: 'Sex', validationRule: {required: true}})
  ]
});
model.setError('danger', 'Danger Will Robinson');
// Create a model validation where males have to be 21
model.onEvent('Validate', function () {
  var name = model.get('name');
  var age = model.get('age');
  var sex = model.get('sex');
  if (sex != 'F' && age < 21)
    model.validationErrors.push('Males must be 21 or over');
});
model.validate(test1);
// Expect 1 error from B9 Robot (Attribute errors ignored if model state error)
function test1() {
  if (model.validationErrors.length == 1) {
    model.clearError('danger');
    model.validate(test2);
  } else {
    callback('test1: ' + model.validationErrors.length);
  }
}
// Expect 3 errors for each attribute
function test2() {
  if (model.validationErrors.length == 3) {
    model.set('name', 'John Doe');
    model.set('age', 18);
    model.set('sex', 'M');
    model.validate(test3);
  } else {
    callback('test2: ' + model.validationErrors.length);
  }
}
// Expect 1 errors since all attributes fixed but model will fail
function test3() {
  if (model.validationErrors.length == 1 && model.validationMessage == 'Males must be 21 or over') {
    model.set('age', 21);
    model.validate(test4);
  } else {
    callback('test3: ' + model.validationErrors.length);
  }
}
// Test done should be no errors (to pass final test)
function test4() {
  callback('test4: ' + model.validationErrors.length);
}
```
<blockquote>returns <strong>test4: 0</strong> as expected
</blockquote>
*29 model tests applied*    

#### ATTRIBUTES
&nbsp;<b><i>following attributes are defined::</i></b>
```javascript
var user = new User(); // default attributes and values
this.shouldBeTrue(user.get('id') === null);
this.shouldBeTrue(user.get('name') === null);
this.shouldBeTrue(user.get('active') === false);
this.shouldBeTrue(user.get('password') === null);
this.shouldBeTrue(user.get('firstName') === null);
this.shouldBeTrue(user.get('lastName') === null);
this.shouldBeTrue(user.get('email') === null);
```
## [&#9664;](#-user)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-memorystore) &nbsp;Workspace
#### Workspace Model
A workspace is a collection of active deltas for a user.  The GUI could represent that as opentabs for instance.  Each tab a model view.  The deltas represent the change in model state    

#### CONSTRUCTOR
&nbsp;<b><i>objects created should be an instance of Workspace:</i></b>
```javascript
return new Workspace() instanceof Workspace;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### CONSTRUCTOR
Creation of all Models must adhere to following examples:    

&nbsp;<b><i>objects created should be an instance of Model:</i></b>
```javascript
return new SurrogateModel() instanceof Model;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
SurrogateModel(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure properties are valid:</i></b>
```javascript
new SurrogateModel({sup: 'yo'});
```
<blockquote><strong>Error: error creating Model: invalid property: sup</strong> thrown as expected
</blockquote>
&nbsp;<b><i>can supply attributes in constructor in addition to ID default:</i></b>
```javascript
var play = new SurrogateModel({attributes: [new Attribute('game')]});
play.set('game', 'scrabble'); // this would throw error if attribute did not exist
return play.get('game');
```
<blockquote>returns <strong>scrabble</strong> as expected
</blockquote>
#### PROPERTIES
#### tags
Tags are an array of strings that can be used in searching.    

&nbsp;<b><i>should be an array or undefined:</i></b>
```javascript
var m = new SurrogateModel(); // default is undefined
this.shouldBeTrue(m.tag === undefined && m.getObjectStateErrors().length === 0);
m.tags = [];
this.shouldBeTrue(m.getObjectStateErrors().length === 0);
m.tags = 'your it';
this.shouldBeTrue(m.getObjectStateErrors().length == 1);
```
#### attributes
The attributes property is an array of Attributes.    

&nbsp;<b><i>should be an array:</i></b>
```javascript
var goodModel = new SurrogateModel(), badModel = new SurrogateModel();
badModel.attributes = 'wtf';
return (goodModel.getObjectStateErrors().length === 0 && badModel.getObjectStateErrors().length == 1);
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>elements of array must be instance of Attribute:</i></b>
```javascript
// passing true to getObjectStateErrors() means only check model and not subclass validations
// todo make unit test for above
var model = new SurrogateModel();
model.attributes = [new Attribute("ID", "ID")];
this.shouldBeTrue(model.getObjectStateErrors(true).length === 0);
model.attributes = [new Attribute("ID", "ID"), new SurrogateModel(), 0, 'a', {}, [], null];
this.shouldBeTrue(model.getObjectStateErrors(true).length == 6);
```
#### METHODS
#### toString()
&nbsp;<b><i>should return a description of the model:</i></b>
```javascript
return new SurrogateModel().toString().length > 0;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### copy(sourceModel)
&nbsp;<b><i>copy all attribute values of a model:</i></b>
```javascript
var Foo = function (args) {
  Model.call(this, args);
  this.modelType = "Foo";
  this.attributes.push(new Attribute('name'));
};
Foo.prototype = inheritPrototype(Model.prototype);
var m1 = new Foo();
var m2 = new Foo();
var m3 = m1;
m1.set('name', 'Bar');
m2.set('name', 'Bar');
// First demonstrate instance ref versus another model with equal attributes
this.shouldBeTrue(m1 === m3); // assigning one model to variable references same instance
this.shouldBeTrue(m3.get('name') === 'Bar'); // m3 changed when m1 changed
this.shouldBeTrue(m1 !== m2); // 2 models are not the same instance
this.shouldBeTrue(JSON.stringify(m1) === JSON.stringify(m2)); // but they are identical
// clone m1 into m4 and demonstrate that contents equal but not same ref to object
var m4 = new Foo();
m4.copy(m1);
this.shouldBeTrue(m1 !== m4); // 2 models are not the same instance
this.shouldBeTrue(JSON.stringify(m1) === JSON.stringify(m4)); // but they are identical
```
#### getObjectStateErrors()
&nbsp;<b><i>should return array of validation errors:</i></b>
```javascript
this.shouldBeTrue(new SurrogateModel().getObjectStateErrors() instanceof Array);
```
&nbsp;<b><i>first attribute must be an ID field:</i></b>
```javascript
var m = new SurrogateModel();
m.attributes = [new Attribute('spoon')];
return m.getObjectStateErrors();
```
<blockquote>returns <strong>first attribute must be ID</strong> as expected
</blockquote>
#### onEvent
Use onEvent(events,callback)    

&nbsp;<b><i>first parameter is a string or array of event subscriptions:</i></b>
```javascript
new SurrogateModel().onEvent();
```
<blockquote><strong>Error: subscription string or array required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback is required:</i></b>
```javascript
new SurrogateModel().onEvent([]);
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>events are checked against known types:</i></b>
```javascript
new SurrogateModel().onEvent(['onDrunk'], function () {
});
```
<blockquote><strong>Error: Unknown command event: onDrunk</strong> thrown as expected
</blockquote>
&nbsp;<b><i>here is a working version:</i></b>
```javascript
this.log('T.getAttributeEvents()');
// Validate - callback when attribute needs to be validated
// StateChange -- callback when state of object (value or validation state) has changed
new Model().onEvent(['Validate'], function () {
});
```
<blockquote><strong>log: </strong>T.getAttributeEvents()<br></blockquote>
#### attribute
&nbsp;<b><i>return attribute by name:</i></b>
```javascript
var attrib = new Attribute("Sue");
var model = new Model({attributes: [attrib]});
return model.attribute("Sue") == attrib;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### getShortName
&nbsp;<b><i>returns short description of model, defaults to first string attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('name')]});
question.attributes[1].value = 'Shorty';
return question.getShortName();
```
<blockquote>returns <strong>Shorty</strong> as expected
</blockquote>
&nbsp;<b><i>if no string attribute found empty string returned:</i></b>
```javascript
// Test for model since models may provide attributes to fail this test
var question = new Model({attributes: [new Attribute('answer', 'Number')]});
question.attributes[1].value = 42;
return question.getShortName();
```
#### getLongName
note - both getShortName and getLongName should be overriden with method returning desired results when needed.    

&nbsp;<b><i>return a more verbose name for model than getShortName:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('name')]});
question.attributes[1].value = 'Shorty';
return question.getLongName();
```
<blockquote>returns <strong>Shorty</strong> as expected
</blockquote>
#### get(attributeName)
&nbsp;<b><i>returns undefined if the attribute does not exist:</i></b>
```javascript
this.shouldBeTrue(new SurrogateModel().get('whatever') === undefined);
```
&nbsp;<b><i>returns the value for given attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('answer', 'Number')]});
question.attributes[1].value = 42;
return question.get('answer');
```
<blockquote>returns <strong>42</strong> as expected
</blockquote>
#### getAttributeType(attributeName)
&nbsp;<b><i>returns attribute type for given attribute name:</i></b>
```javascript
return new SurrogateModel({attributes: [new Attribute('born', 'Date')]}).getAttributeType('born');
```
<blockquote>returns <strong>Date</strong> as expected
</blockquote>
#### set(attributeName,value)
&nbsp;<b><i>throws an error if the attribute does not exists:</i></b>
```javascript
new SurrogateModel().set('whatever');
```
<blockquote><strong>Error: attribute not valid for model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>sets the value for given attribute:</i></b>
```javascript
var question = new SurrogateModel({attributes: [new Attribute('answer', 'Number')]});
question.set('answer', 42);
return question.attributes[1].value;
```
<blockquote>returns <strong>42</strong> as expected
</blockquote>
#### validate
check valid object state and value for attribute - invoke callback for results    

&nbsp;<b><i>callback is required:</i></b>
```javascript
new Model().validate();
```
<blockquote><strong>Error: callback is required</strong> thrown as expected
</blockquote>
#### setError
Set a error condition and descriptive message    

&nbsp;<b><i>first argument condition required:</i></b>
```javascript
new Model().setError();
```
<blockquote><strong>Error: condition required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>second argument description required:</i></b>
```javascript
new Model().setError('login');
```
<blockquote><strong>Error: description required</strong> thrown as expected
</blockquote>
#### clearError
Clear a error condition    

&nbsp;<b><i>first argument condition required:</i></b>
```javascript
new Model().clearError();
```
<blockquote><strong>Error: condition required</strong> thrown as expected
</blockquote>
#### INTEGRATION
&nbsp;<b><i>model validation usage demonstrated:</i></b>
```javascript
// Create a model with each attribute having and error
var model = new Model({
  attributes: [
    new Attribute({name: 'Name', validationRule: {required: true}}),
    new Attribute({name: 'Age', type: 'Number', validationRule: {range: [18, null]}}),
    new Attribute({name: 'Sex', validationRule: {required: true}})
  ]
});
model.setError('danger', 'Danger Will Robinson');
// Create a model validation where males have to be 21
model.onEvent('Validate', function () {
  var name = model.get('name');
  var age = model.get('age');
  var sex = model.get('sex');
  if (sex != 'F' && age < 21)
    model.validationErrors.push('Males must be 21 or over');
});
model.validate(test1);
// Expect 1 error from B9 Robot (Attribute errors ignored if model state error)
function test1() {
  if (model.validationErrors.length == 1) {
    model.clearError('danger');
    model.validate(test2);
  } else {
    callback('test1: ' + model.validationErrors.length);
  }
}
// Expect 3 errors for each attribute
function test2() {
  if (model.validationErrors.length == 3) {
    model.set('name', 'John Doe');
    model.set('age', 18);
    model.set('sex', 'M');
    model.validate(test3);
  } else {
    callback('test2: ' + model.validationErrors.length);
  }
}
// Expect 1 errors since all attributes fixed but model will fail
function test3() {
  if (model.validationErrors.length == 1 && model.validationMessage == 'Males must be 21 or over') {
    model.set('age', 21);
    model.validate(test4);
  } else {
    callback('test3: ' + model.validationErrors.length);
  }
}
// Test done should be no errors (to pass final test)
function test4() {
  callback('test4: ' + model.validationErrors.length);
}
```
<blockquote>returns <strong>test4: 0</strong> as expected
</blockquote>
*29 model tests applied*    

#### ATTRIBUTES
&nbsp;<b><i>following attributes are defined::</i></b>
```javascript
var user = new Workspace(); // default attributes and values
this.shouldBeTrue(user.get('id') !== undefined);
this.shouldBeTrue(user.get('user') instanceof Attribute.ModelID);
this.shouldBeTrue(user.get('user').modelType == 'User');
this.shouldBeTrue(typeof user.get('deltas') == 'object');
```
#### METHODS
loadUserWorkspace(user, callback)    

sync    

#### INTEGRATION

## [&#9664;](#-workspace)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-array-functions) &nbsp;MemoryStore
#### MemoryStore
The MemoryStore is a simple volatile store. It is the first test standard to define the spec for all Stores to follow.    

#### CONSTRUCTOR
#### Store Constructor tests are applied
&nbsp;<b><i>objects created should be an instance of Store:</i></b>
```javascript
return new SurrogateStore() instanceof Store;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
SurrogateStore(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure properties are valid:</i></b>
```javascript
new SurrogateStore({food: 'twinkies'});
```
<blockquote><strong>Error: error creating Store: invalid property: food</strong> thrown as expected
</blockquote>
&nbsp;<b><i>objects created should be an instance of MemoryStore:</i></b>
```javascript
return new MemoryStore() instanceof MemoryStore;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### Store tests are applied
#### PROPERTIES
#### name
&nbsp;<b><i>name of store can be set in constructor:</i></b>
```javascript
return new SurrogateStore({name: 'punchedCards'}).name;
```
<blockquote>returns <strong>punchedCards</strong> as expected
</blockquote>
#### storeType
storeType defaults to Store Class Name but can be set to suite the app architecture.    

&nbsp;<b><i>storeType can be set in constructor:</i></b>
```javascript
return new SurrogateStore({storeType: 'legacyStorage'}).storeType;
```
<blockquote>returns <strong>legacyStorage</strong> as expected
</blockquote>
#### METHODS
&nbsp;<b><i>getServices() returns an object with interface for the Store.:</i></b>
```javascript
this.log(JSON.stringify(services));
this.shouldBeTrue(services instanceof Object);
this.shouldBeTrue(typeof services['isReady'] == 'boolean'); // don't use until
this.shouldBeTrue(typeof services['canGetModel'] == 'boolean'); // define all allowed methods...
this.shouldBeTrue(typeof services['canPutModel'] == 'boolean');
this.shouldBeTrue(typeof services['canDeleteModel'] == 'boolean');
this.shouldBeTrue(typeof services['canGetList'] == 'boolean');
```
<blockquote><strong>log: </strong>{"isReady":true,"canGetModel":true,"canPutModel":true,"canDeleteModel":true,"canGetList":true}<br></blockquote>
#### toString()
&nbsp;<b><i>should return a description of the Store:</i></b>
```javascript
var cStore = new SurrogateStore();
this.log(cStore.toString());
cStore.name = '7-Eleven';
cStore.storeType = 'ConvenienceStore';
this.log(cStore.toString());
return cStore.toString();
```
<blockquote><strong>log: </strong>a MemoryStore<br><strong>log: </strong>ConvenienceStore: 7-Eleven<br>returns <strong>ConvenienceStore: 7-Eleven</strong> as expected
</blockquote>
#### onConnect()
&nbsp;<b><i>must pass url string:</i></b>
```javascript
new SurrogateStore().onConnect();
```
<blockquote><strong>Error: argument must a url string</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must pass callback function:</i></b>
```javascript
new SurrogateStore().onConnect("");
```
<blockquote><strong>Error: argument must a callback</strong> thrown as expected
</blockquote>
&nbsp;<b><i>return store and undefined error upon successful connection to remote store.:</i></b>
```javascript
new SurrogateStore().onConnect('', function (store, err) {
  if (err) {
    callback(err);
  } else {
    callback(store instanceof Store);
  }
});
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### getModel()
&nbsp;<b><i>must pass valid model:</i></b>
```javascript
new SurrogateStore().getModel();
```
<blockquote><strong>Error: argument must be a Model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>model must have no validation errors:</i></b>
```javascript
var m = new Model();
m.attributes = null;
new SurrogateStore().getModel(m);
```
<blockquote><strong>Error: model has validation errors</strong> thrown as expected
</blockquote>
&nbsp;<b><i>ID attribute must have truthy value:</i></b>
```javascript
new SurrogateStore().getModel(new Model());
```
<blockquote><strong>Error: ID not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback function required:</i></b>
```javascript
var m = new Model();
m.attributes[0].value = 1;
new SurrogateStore().getModel(m);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>returns error when model not found:</i></b>
```javascript
var m = new Model();
m.modelType = "Supermodel"; // change type so one not used in tests
m.attributes[0].value = 1;
new SurrogateStore().getModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod);
  }
});
```
<blockquote>returns <strong>Error: model not found in store</strong> as expected
</blockquote>
#### putModel(model)
&nbsp;<b><i>must pass valid model:</i></b>
```javascript
new SurrogateStore().putModel();
```
<blockquote><strong>Error: argument must be a Model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>model must have no validation errors:</i></b>
```javascript
var m = new Model();
m.attributes = null;
new SurrogateStore().putModel(m);
```
<blockquote><strong>Error: model has validation errors</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback function required:</i></b>
```javascript
var m = new Model();
m.attributes[0].value = 1;
new SurrogateStore().putModel(m);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>returns error when model not found:</i></b>
```javascript
var m = new Model();
m.modelType = "Supermodel";
m.attributes[0].value = 1;
new SurrogateStore().putModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod);
  }
});
```
<blockquote>returns <strong>Error: model not found in store</strong> as expected
</blockquote>
&nbsp;<b><i>creates new model when ID is not set:</i></b>
```javascript
// This works but pollutes store with crap
var m = new Model();
new SurrogateStore().putModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod.get('id') ? true : false);
  }
});
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### deleteModel(model)
&nbsp;<b><i>must pass valid model:</i></b>
```javascript
new SurrogateStore().deleteModel();
```
<blockquote><strong>Error: argument must be a Model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>model must have no validation errors:</i></b>
```javascript
var m = new Model();
m.attributes = null;
new SurrogateStore().deleteModel(m);
```
<blockquote><strong>Error: model has validation errors</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback function required:</i></b>
```javascript
var m = new Model();
m.attributes[0].value = 1;
new SurrogateStore().deleteModel(m);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>returns error when model not found:</i></b>
```javascript
var m = new Model();
m.modelType = 'PeopleAreString!';
m.attributes[0].value = 90210;
new SurrogateStore().deleteModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod);
  }
});
```
<blockquote>returns <strong>Error: model not found in store</strong> as expected
</blockquote>
#### getList(model, filter, order)
This method will clear and populate the list with collection from store.  The **filter** property can be used to query the store.  The **order** property can specify the sort order of the list.  _See integration test for more info._    

&nbsp;<b><i>returns a List populated from store:</i></b>
```javascript
this.shouldThrowError(Error('argument must be a List'), function () {
  new SurrogateStore().getList();
});
this.shouldThrowError(Error('filter argument must be Object'), function () {
  new SurrogateStore().getList(new List(new Model()));
});
this.shouldThrowError(Error('callback required'), function () {
  new SurrogateStore().getList(new List(new Model()), []);
});
// See integration tests for examples of usage
```
#### Store Integration
&nbsp;<b><i>Check each type:</i></b>
```javascript
var self = this;
spec.integrationStore = new SurrogateStore();
// If store is not ready then get out...
if (!spec.integrationStore.getServices().isReady) {
  self.log('Store is not ready.');
  callback(true);
  return;
}
self.Types = function (args) {
  Model.call(this, args);
  this.modelType = "_tempTypes";
  this.attributes.push(new Attribute({name: 'String', type: 'String', value: 'cheese'}));
  this.attributes.push(new Attribute({name: 'Date', type: 'Date', value: new Date()}));
  this.attributes.push(new Attribute({name: 'Boolean', type: 'Boolean', value: true}));
  this.attributes.push(new Attribute({name: 'Number', type: 'Number', value: 42}));
};
self.Types.prototype = Object.create(Model.prototype);
self.types = new self.Types();
self.types2 = new self.Types();
self.types2.copy(self.types);
spec.integrationStore.putModel(self.types, function (model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('String') == self.types2.get('String'));
  self.shouldBeTrue(model.get('Date') == self.types2.get('Date'));
  self.shouldBeTrue(model.get('Date') instanceof Date);
  self.shouldBeTrue(model.get('Boolean') == self.types2.get('Boolean'));
  self.shouldBeTrue(model.get('Number') == self.types2.get('Number'));
  callback(true);
});
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### CRUD (Create Read Update Delete)
&nbsp;<b><i>Exercise all store function for one store.:</i></b>
```javascript
var self = this;
spec.integrationStore = new SurrogateStore();
var storeBeingTested = spec.integrationStore.name + ' ' + spec.integrationStore.storeType;
self.log(storeBeingTested);
// If store is not ready then get out...
if (!spec.integrationStore.getServices().isReady) {
  self.log('Store is not ready.');
  callback(true);
  return;
}
// setup stooge class
self.Stooge = function (args) {
  Model.call(this, args);
  this.modelType = "_tempTest_Stooge";
  this.attributes.push(new Attribute('name'));
};
self.Stooge.prototype = inheritPrototype(Model.prototype);
// create initial stooges
self.moe = new self.Stooge();
self.moe.set('name', 'Moe');
self.larry = new self.Stooge();
self.larry.set('name', 'Larry');
self.shemp = new self.Stooge();
self.shemp.set('name', 'Shemp');
// IDs after stored will be here
self.stoogeIDsStored = [];
self.stoogesRetrieved = [];
self.oldStoogesFound = 0;
self.oldStoogesKilled = 0;
// Make sure store starts in known state.  Stores such as mongoStore will retain test values.
// So... use getList to get all stooges then delete them from the Store
var useListToCleanStart = spec.integrationStore.getServices().canGetList;
if (useListToCleanStart) {
  var list = new List(new self.Stooge());
  try {
    self.killhim = new self.Stooge();
    spec.integrationStore.getList(list, [], function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      if (list._items.length < 1)
        storeStooges();
      else
        self.oldStoogesFound = list._items.length;
      for (var i = 0; i < list._items.length; i++) {
        self.killhim.set('id', list._items[i][0]);
        /* jshint ignore:start */
        spec.integrationStore.deleteModel(self.killhim, function (model, error) {
          if (++self.oldStoogesKilled >= self.oldStoogesFound) {
            storeStooges();
          }
        })
        /* jshint ignore:end */
      }
    });
  }
  catch (err) {
    callback(err);
  }
} else {
  storeStooges();
}
// callback to store new stooges
function storeStooges() {
  self.log(self.oldStoogesFound);
  self.log(self.oldStoogesKilled);
  spec.integrationStore.putModel(self.moe, stoogeStored);
  spec.integrationStore.putModel(self.larry, stoogeStored);
  spec.integrationStore.putModel(self.shemp, stoogeStored);
}
// callback after storing stooges
function stoogeStored(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  try {
    self.stoogeIDsStored.push(model.get('id'));
    if (self.stoogeIDsStored.length == 3) {
      self.shouldBeTrue(true, 'here');
      // Now that first 3 stooges are stored lets retrieve and verify
      var actors = [];
      for (var i = 0; i < 3; i++) {
        actors.push(new self.Stooge());
        actors[i].set('id', self.stoogeIDsStored[i]);
        spec.integrationStore.getModel(actors[i], stoogeRetrieved);
      }
    }
  }
  catch (err) {
    callback(err);
  }
}
// callback after retrieving stored stooges
function stoogeRetrieved(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.stoogesRetrieved.push(model);
  if (self.stoogesRetrieved.length == 3) {
    self.shouldBeTrue(true, 'here');
    // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
    self.shouldBeTrue(self.stoogesRetrieved[0] !== self.moe && // Make sure not a reference but a copy
      self.stoogesRetrieved[0] !== self.larry && self.stoogesRetrieved[0] !== self.shemp, 'copy');
    var s = []; // get list of names to see if all stooges made it
    for (var i = 0; i < 3; i++) s.push(self.stoogesRetrieved[i].get('name'));
    self.log(s);
    self.shouldBeTrue(contains(s, 'Moe') && contains(s, 'Larry') && contains(s, 'Shemp'));
    // Replace Shemp with Curly
    var didPutCurly = false;
    for (i = 0; i < 3; i++) {
      if (self.stoogesRetrieved[i].get('name') == 'Shemp') {
        didPutCurly = true;
        self.stoogesRetrieved[i].set('name', 'Curly');
        try {
          spec.integrationStore.putModel(self.stoogesRetrieved[i], stoogeChanged);
        }
        catch (err) {
          callback(err);
        }
      }
    }
    if (!didPutCurly) {
      callback(Error("Can't find Shemp!"));
    }
  }
}
// callback after storing changed stooge
function stoogeChanged(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('name') == 'Curly', 'Curly');
  var curly = new self.Stooge();
  curly.set('id', model.get('id'));
  try {
    spec.integrationStore.getModel(curly, storeChangedShempToCurly);
  }
  catch (err) {
    callback(err);
  }
}
// callback after retrieving changed stooge
function storeChangedShempToCurly(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('name') == 'Curly', 'Curly');
  // Now test delete
  self.deletedModelId = model.get('id'); // Remember this
  spec.integrationStore.deleteModel(model, stoogeDeleted);
}
// callback when Curly is deleted
function stoogeDeleted(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  // model parameter is what was deleted
  self.shouldBeTrue(undefined === model.get('id')); // ID removed
  self.shouldBeTrue(model.get('name') == 'Curly'); // the rest remains
  // Is it really dead?
  var curly = new self.Stooge();
  curly.set('id', self.deletedModelId);
  spec.integrationStore.getModel(curly, hesDeadJim);
}
// callback after lookup of dead stooge
function hesDeadJim(model, error) {
  if (typeof error != 'undefined') {
    if ((error != 'Error: id not found in store') && (error != 'Error: model not found in store')) {
      callback(error);
      return;
    }
  } else {
    callback(Error('no error deleting stooge when expected'));
    return;
  }
  // Skip List test if subclass can't do
  if (!spec.integrationStore.getServices().canGetList) {
    callback(true);
  } else {
    // Now create a list from the stooge store
    var list = new List(new self.Stooge());
    try {
      spec.integrationStore.getList(list, {}, {name: 1}, listReady);
    }
    catch (err) {
      callback(err);
    }
  }
}
// callback after list created from store
function listReady(list, error) {
//          list.sort({name:1});
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(list instanceof List, 'is list');
  self.shouldBeTrue(list.length() == 2, 'is 2');
  list.moveFirst();
  self.shouldBeTrue(list.get('name') == 'Larry', 'larry');
  list.moveNext();
  self.shouldBeTrue(list.get('name') == 'Moe', 'moe');
  callback(true);
}
```
<blockquote><strong>log: </strong>a MemoryStore MemoryStore<br><strong>log: </strong>0<br><strong>log: </strong>0<br><strong>log: </strong>Moe,Larry,Shemp<br>returns <strong>true</strong> as expected
</blockquote>

## [&#9664;](#-memorystore)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-object-functions) &nbsp;Array Functions
#### ARRAY FUNCTIONS
#### contains(array,object)
This method returns true or false as to whether object is contained in array.    

&nbsp;<b><i>object exists in array:</i></b>
```javascript
return contains(['moe', 'larry', 'curley'], 'larry');
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>object does not exist in array:</i></b>
```javascript
return contains(['moe', 'larry', 'curley'], 'shemp');
```
## [&#9664;](#-array-functions)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-string-functions) &nbsp;Object Functions
#### inheritPrototype(p)
[deprecated] ex: User.prototype = Object.create(Model.prototype);    

&nbsp;<b><i>Cannot pass null:</i></b>
```javascript
this.shouldThrowError('*', function () {
  inheritPrototype(null);
});
```
&nbsp;<b><i>quack like a duck:</i></b>
```javascript
// Duck class
var Duck = function () {
};
// Duck method
Duck.prototype.sound = function () {
  return 'quack';
};
// Mallard class
var Mallard = function () {
};
// Mallard inherits Duck prototype
Mallard.prototype = inheritPrototype(Duck.prototype);
// Create instance
var daffy = new Mallard();
// Instance of constructor & the inherited prototype's class fir daffy
this.shouldBeTrue(daffy instanceof Mallard);
this.shouldBeTrue(daffy instanceof Duck);
// What sound does daffy make?
return daffy.sound();
```
<blockquote>returns <strong>quack</strong> as expected
</blockquote>
#### getInvalidProperties(args,allowedProperties)
Functions that take an object as it's parameter use this to validate the properties of the parameter by returning any invalid properties    

&nbsp;<b><i>valid property:</i></b>
```javascript
// got Kahn and value backwards so Kahn is an unknown property
return getInvalidProperties({name: 'name', Kahn: 'value'}, ['name', 'value'])[0];
```
<blockquote>returns <strong>Kahn</strong> as expected
</blockquote>
&nbsp;<b><i>invalid property:</i></b>
```javascript
// no unknown properties
return getInvalidProperties({name: 'name', value: 'Kahn'}, ['name', 'value']).length;
```
#### getConstructorFromModelType(modelType)
&nbsp;<b><i>returns Model constructor if type not registered:</i></b>
```javascript
return getConstructorFromModelType();
```
<blockquote>returns <strong>function (args) {
  var i;
  if (false === (this instanceof Model)) throw new Error('new operator required');
  this.modelType = "Model";
  this.attributes = [new Attribute('id', 'ID')];
  args = args || {};
  if (args.attributes) {
    for (i in args.attributes) {
      if (args.attributes.hasOwnProperty(i))
        this.attributes.push(args.attributes[i]);
    }
  }
  var unusedProperties = getInvalidProperties(args, ['attributes']);
  var errorList = this.getObjectStateErrors(); // before leaving make sure valid Model
  for (i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Model: multiple errors');
  if (errorList.length) throw new Error('error creating Model: ' + errorList[0]);
  // Validations done
  this._eventListeners = [];
  this._errorConditions = {};
}</strong> as expected
</blockquote>
&nbsp;<b><i>registered models return the constructor function:</i></b>
```javascript
return getConstructorFromModelType('User');
```
<blockquote>returns <strong>function (args) {
  if (false === (this instanceof User)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  args.attributes.push(new Attribute({name: 'name', type: 'String(20)'}));
  args.attributes.push(new Attribute({name: 'active', type: 'Boolean'}));
  args.attributes.push(new Attribute({name: 'password', type: 'String(20)'}));
  args.attributes.push(new Attribute({name: 'firstName', type: 'String(35)'}));
  args.attributes.push(new Attribute({name: 'lastName', type: 'String(35)'}));
  args.attributes.push(new Attribute({name: 'email', type: 'String(20)'}));
  Model.call(this, args);
  this.modelType = "User";
  this.set('active', false);
}</strong> as expected
</blockquote>
&nbsp;<b><i>objects created utilize proper constructor:</i></b>
```javascript
var ProxyModel = getConstructorFromModelType('User');
var proxyModel = new ProxyModel();
return proxyModel.get('active');
```
&nbsp;<b><i>Core models are known:</i></b>
```javascript
this.shouldBeTrue(getConstructorFromModelType('User') == User);
this.shouldBeTrue(getConstructorFromModelType('Session') == Session);
this.shouldBeTrue(getConstructorFromModelType('Workspace') == Workspace);
this.shouldBeTrue(getConstructorFromModelType('Presentation') == Presentation);
this.shouldBeTrue(getConstructorFromModelType('Log') == Log);
this.shouldBeTrue(getConstructorFromModelType('Application') == Application);
```
#### createModelFromModelType
&nbsp;<b><i>returns instance of Model if type not registered:</i></b>
```javascript
return createModelFromModelType().modelType;
```
<blockquote>returns <strong>Model</strong> as expected
</blockquote>
&nbsp;<b><i>objects created utilize proper constructor:</i></b>
```javascript
return createModelFromModelType('User').get('active');
```
## [&#9664;](#-object-functions)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-mongodb) &nbsp;String Functions
#### STRING FUNCTIONS
#### trim(string)
&nbsp;<b><i>Remove leading and trailing spaces from string:</i></b>
```javascript
return '(' + trim(' hello ') + ')';
```
<blockquote>returns <strong>(hello)</strong> as expected
</blockquote>
#### ltrim(string)
&nbsp;<b><i>Remove leading spaces from string:</i></b>
```javascript
return '(' + ltrim(' hello ') + ')';
```
<blockquote>returns <strong>(hello )</strong> as expected
</blockquote>
#### rtrim(string)
&nbsp;<b><i>Remove trailing spaces from string:</i></b>
```javascript
return '(' + rtrim(' hello ') + ')';
```
<blockquote>returns <strong>( hello)</strong> as expected
</blockquote>
#### left(string)
&nbsp;<b><i>return left part of string:</i></b>
```javascript
return left('12345',3);
```
<blockquote>returns <strong>123</strong> as expected
</blockquote>
#### right(string)
&nbsp;<b><i>return right part of string:</i></b>
```javascript
return right('12345',3);
```
<blockquote>returns <strong>345</strong> as expected
</blockquote>
#### center(string)
&nbsp;<b><i>return center part of string:</i></b>
```javascript
return center('12345',3);
```
<blockquote>returns <strong>234</strong> as expected
</blockquote>
#### lpad(string, length, fillChar)
Return string size length with fillChar padded on left.  fillChar is optional and defaults to space.    

&nbsp;<b><i>add leading asteriks:</i></b>
```javascript
return lpad('42', 10, '*');
```
<blockquote>returns <strong>********42</strong> as expected
</blockquote>
&nbsp;<b><i>truncate when length is less than string length:</i></b>
```javascript
return lpad('okay', 2);
```
<blockquote>returns <strong>ok</strong> as expected
</blockquote>
&nbsp;<b><i>fillChar defaults to space:</i></b>
```javascript
return ':' + lpad('x',2) + ':';
```
<blockquote>returns <strong>: x:</strong> as expected
</blockquote>
#### rpad(string, length, fillChar)
Return string size length with fillChar padded on right.  fillChar is optional and defaults to space.    

&nbsp;<b><i>Add trailing periods:</i></b>
```javascript
return rpad('etc', 6, '.');
```
<blockquote>returns <strong>etc...</strong> as expected
</blockquote>
&nbsp;<b><i>truncate when length is less than string length:</i></b>
```javascript
return rpad('wassup', 3);
```
<blockquote>returns <strong>sup</strong> as expected
</blockquote>
&nbsp;<b><i>fillChar defaults to space:</i></b>
```javascript
return ':' + rpad('x',2) + ':';
```
<blockquote>returns <strong>:x :</strong> as expected
</blockquote>
#### cpad(string, length, fillChar)
Return string size length with fillChar padded on left and right.  fillChar is optional and defaults to space.    

&nbsp;<b><i>center with periods:</i></b>
```javascript
return cpad('center', 13, '.');
```
<blockquote>returns <strong>...center....</strong> as expected
</blockquote>
&nbsp;<b><i>truncate when length is less than string length:</i></b>
```javascript
return cpad('abcdef', 2);
```
<blockquote>returns <strong>cd</strong> as expected
</blockquote>
&nbsp;<b><i>fillChar defaults to space:</i></b>
```javascript
return ':' + cpad('x',3) + ':';
```
<blockquote>returns <strong>: x :</strong> as expected
</blockquote>
## [&#9664;](#-string-functions)&nbsp;[&#8984;](#constructors)&nbsp;[&#9654;](#-summary) &nbsp;MONGODB
#### MongoStore
The MongoStore handles data storage via MongoDB.    

Core tests run: {"testsCreated":29}    

#### CONSTRUCTOR
#### Store Constructor tests are applied
&nbsp;<b><i>objects created should be an instance of Store:</i></b>
```javascript
return new SurrogateStore() instanceof Store;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>should make sure new operator used:</i></b>
```javascript
SurrogateStore(); // jshint ignore:line
```
<blockquote><strong>Error: new operator required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>should make sure properties are valid:</i></b>
```javascript
new SurrogateStore({food: 'twinkies'});
```
<blockquote><strong>Error: error creating Store: invalid property: food</strong> thrown as expected
</blockquote>
&nbsp;<b><i>objects created should be an instance of MongoStore:</i></b>
```javascript
return new MongoStore() instanceof MongoStore;
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### Store tests are applied
#### PROPERTIES
#### name
&nbsp;<b><i>name of store can be set in constructor:</i></b>
```javascript
return new SurrogateStore({name: 'punchedCards'}).name;
```
<blockquote>returns <strong>punchedCards</strong> as expected
</blockquote>
#### storeType
storeType defaults to Store Class Name but can be set to suite the app architecture.    

&nbsp;<b><i>storeType can be set in constructor:</i></b>
```javascript
return new SurrogateStore({storeType: 'legacyStorage'}).storeType;
```
<blockquote>returns <strong>legacyStorage</strong> as expected
</blockquote>
#### METHODS
&nbsp;<b><i>getServices() returns an object with interface for the Store.:</i></b>
```javascript
this.log(JSON.stringify(services));
this.shouldBeTrue(services instanceof Object);
this.shouldBeTrue(typeof services['isReady'] == 'boolean'); // don't use until
this.shouldBeTrue(typeof services['canGetModel'] == 'boolean'); // define all allowed methods...
this.shouldBeTrue(typeof services['canPutModel'] == 'boolean');
this.shouldBeTrue(typeof services['canDeleteModel'] == 'boolean');
this.shouldBeTrue(typeof services['canGetList'] == 'boolean');
```
<blockquote><strong>log: </strong>{"isReady":true,"canGetModel":true,"canPutModel":true,"canDeleteModel":true,"canGetList":true}<br></blockquote>
#### toString()
&nbsp;<b><i>should return a description of the Store:</i></b>
```javascript
var cStore = new SurrogateStore();
this.log(cStore.toString());
cStore.name = '7-Eleven';
cStore.storeType = 'ConvenienceStore';
this.log(cStore.toString());
return cStore.toString();
```
<blockquote><strong>log: </strong>a MongoStore<br><strong>log: </strong>ConvenienceStore: 7-Eleven<br>returns <strong>ConvenienceStore: 7-Eleven</strong> as expected
</blockquote>
#### onConnect()
&nbsp;<b><i>must pass url string:</i></b>
```javascript
new SurrogateStore().onConnect();
```
<blockquote><strong>Error: argument must a url string</strong> thrown as expected
</blockquote>
&nbsp;<b><i>must pass callback function:</i></b>
```javascript
new SurrogateStore().onConnect("");
```
<blockquote><strong>Error: argument must a callback</strong> thrown as expected
</blockquote>
&nbsp;<b><i>return store and undefined error upon successful connection to remote store.:</i></b>
```javascript
new SurrogateStore().onConnect('', function (store, err) {
  if (err) {
    callback(err);
  } else {
    callback(store instanceof Store);
  }
});
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### getModel()
&nbsp;<b><i>must pass valid model:</i></b>
```javascript
new SurrogateStore().getModel();
```
<blockquote><strong>Error: argument must be a Model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>model must have no validation errors:</i></b>
```javascript
var m = new Model();
m.attributes = null;
new SurrogateStore().getModel(m);
```
<blockquote><strong>Error: model has validation errors</strong> thrown as expected
</blockquote>
&nbsp;<b><i>ID attribute must have truthy value:</i></b>
```javascript
new SurrogateStore().getModel(new Model());
```
<blockquote><strong>Error: ID not set</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback function required:</i></b>
```javascript
var m = new Model();
m.attributes[0].value = 1;
new SurrogateStore().getModel(m);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>returns error when model not found:</i></b>
```javascript
var m = new Model();
m.modelType = "Supermodel"; // change type so one not used in tests
m.attributes[0].value = 1;
new SurrogateStore().getModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod);
  }
});
```
<blockquote>returns <strong>Error: model not found in store</strong> as expected
</blockquote>
#### putModel(model)
&nbsp;<b><i>must pass valid model:</i></b>
```javascript
new SurrogateStore().putModel();
```
<blockquote><strong>Error: argument must be a Model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>model must have no validation errors:</i></b>
```javascript
var m = new Model();
m.attributes = null;
new SurrogateStore().putModel(m);
```
<blockquote><strong>Error: model has validation errors</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback function required:</i></b>
```javascript
var m = new Model();
m.attributes[0].value = 1;
new SurrogateStore().putModel(m);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>returns error when model not found:</i></b>
```javascript
var m = new Model();
m.modelType = "Supermodel";
m.attributes[0].value = 1;
new SurrogateStore().putModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod);
  }
});
```
<blockquote>returns <strong>Error: model not found in store</strong> as expected
</blockquote>
&nbsp;<b><i>creates new model when ID is not set:</i></b>
```javascript
// This works but pollutes store with crap
var m = new Model();
new SurrogateStore().putModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod.get('id') ? true : false);
  }
});
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### deleteModel(model)
&nbsp;<b><i>must pass valid model:</i></b>
```javascript
new SurrogateStore().deleteModel();
```
<blockquote><strong>Error: argument must be a Model</strong> thrown as expected
</blockquote>
&nbsp;<b><i>model must have no validation errors:</i></b>
```javascript
var m = new Model();
m.attributes = null;
new SurrogateStore().deleteModel(m);
```
<blockquote><strong>Error: model has validation errors</strong> thrown as expected
</blockquote>
&nbsp;<b><i>callback function required:</i></b>
```javascript
var m = new Model();
m.attributes[0].value = 1;
new SurrogateStore().deleteModel(m);
```
<blockquote><strong>Error: callback required</strong> thrown as expected
</blockquote>
&nbsp;<b><i>returns error when model not found:</i></b>
```javascript
var m = new Model();
m.modelType = 'PeopleAreString!';
m.attributes[0].value = 90210;
new SurrogateStore().deleteModel(m, function (mod, err) {
  if (err) {
    callback(err);
  } else {
    callback(mod);
  }
});
```
<blockquote>returns <strong>Error: model not found in store</strong> as expected
</blockquote>
#### getList(model, filter, order)
This method will clear and populate the list with collection from store.  The **filter** property can be used to query the store.  The **order** property can specify the sort order of the list.  _See integration test for more info._    

&nbsp;<b><i>returns a List populated from store:</i></b>
```javascript
this.shouldThrowError(Error('argument must be a List'), function () {
  new SurrogateStore().getList();
});
this.shouldThrowError(Error('filter argument must be Object'), function () {
  new SurrogateStore().getList(new List(new Model()));
});
this.shouldThrowError(Error('callback required'), function () {
  new SurrogateStore().getList(new List(new Model()), []);
});
// See integration tests for examples of usage
```
#### Store Integration
&nbsp;<b><i>Check each type:</i></b>
```javascript
var self = this;
spec.integrationStore = new SurrogateStore();
// If store is not ready then get out...
if (!spec.integrationStore.getServices().isReady) {
  self.log('Store is not ready.');
  callback(true);
  return;
}
self.Types = function (args) {
  Model.call(this, args);
  this.modelType = "_tempTypes";
  this.attributes.push(new Attribute({name: 'String', type: 'String', value: 'cheese'}));
  this.attributes.push(new Attribute({name: 'Date', type: 'Date', value: new Date()}));
  this.attributes.push(new Attribute({name: 'Boolean', type: 'Boolean', value: true}));
  this.attributes.push(new Attribute({name: 'Number', type: 'Number', value: 42}));
};
self.Types.prototype = Object.create(Model.prototype);
self.types = new self.Types();
self.types2 = new self.Types();
self.types2.copy(self.types);
spec.integrationStore.putModel(self.types, function (model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('String') == self.types2.get('String'));
  self.shouldBeTrue(model.get('Date') == self.types2.get('Date'));
  self.shouldBeTrue(model.get('Date') instanceof Date);
  self.shouldBeTrue(model.get('Boolean') == self.types2.get('Boolean'));
  self.shouldBeTrue(model.get('Number') == self.types2.get('Number'));
  callback(true);
});
```
<blockquote>returns <strong>true</strong> as expected
</blockquote>
#### CRUD (Create Read Update Delete)
&nbsp;<b><i>Exercise all store function for one store.:</i></b>
```javascript
var self = this;
spec.integrationStore = new SurrogateStore();
var storeBeingTested = spec.integrationStore.name + ' ' + spec.integrationStore.storeType;
self.log(storeBeingTested);
// If store is not ready then get out...
if (!spec.integrationStore.getServices().isReady) {
  self.log('Store is not ready.');
  callback(true);
  return;
}
// setup stooge class
self.Stooge = function (args) {
  Model.call(this, args);
  this.modelType = "_tempTest_Stooge";
  this.attributes.push(new Attribute('name'));
};
self.Stooge.prototype = inheritPrototype(Model.prototype);
// create initial stooges
self.moe = new self.Stooge();
self.moe.set('name', 'Moe');
self.larry = new self.Stooge();
self.larry.set('name', 'Larry');
self.shemp = new self.Stooge();
self.shemp.set('name', 'Shemp');
// IDs after stored will be here
self.stoogeIDsStored = [];
self.stoogesRetrieved = [];
self.oldStoogesFound = 0;
self.oldStoogesKilled = 0;
// Make sure store starts in known state.  Stores such as mongoStore will retain test values.
// So... use getList to get all stooges then delete them from the Store
var useListToCleanStart = spec.integrationStore.getServices().canGetList;
if (useListToCleanStart) {
  var list = new List(new self.Stooge());
  try {
    self.killhim = new self.Stooge();
    spec.integrationStore.getList(list, [], function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      if (list._items.length < 1)
        storeStooges();
      else
        self.oldStoogesFound = list._items.length;
      for (var i = 0; i < list._items.length; i++) {
        self.killhim.set('id', list._items[i][0]);
        /* jshint ignore:start */
        spec.integrationStore.deleteModel(self.killhim, function (model, error) {
          if (++self.oldStoogesKilled >= self.oldStoogesFound) {
            storeStooges();
          }
        })
        /* jshint ignore:end */
      }
    });
  }
  catch (err) {
    callback(err);
  }
} else {
  storeStooges();
}
// callback to store new stooges
function storeStooges() {
  self.log(self.oldStoogesFound);
  self.log(self.oldStoogesKilled);
  spec.integrationStore.putModel(self.moe, stoogeStored);
  spec.integrationStore.putModel(self.larry, stoogeStored);
  spec.integrationStore.putModel(self.shemp, stoogeStored);
}
// callback after storing stooges
function stoogeStored(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  try {
    self.stoogeIDsStored.push(model.get('id'));
    if (self.stoogeIDsStored.length == 3) {
      self.shouldBeTrue(true, 'here');
      // Now that first 3 stooges are stored lets retrieve and verify
      var actors = [];
      for (var i = 0; i < 3; i++) {
        actors.push(new self.Stooge());
        actors[i].set('id', self.stoogeIDsStored[i]);
        spec.integrationStore.getModel(actors[i], stoogeRetrieved);
      }
    }
  }
  catch (err) {
    callback(err);
  }
}
// callback after retrieving stored stooges
function stoogeRetrieved(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.stoogesRetrieved.push(model);
  if (self.stoogesRetrieved.length == 3) {
    self.shouldBeTrue(true, 'here');
    // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
    self.shouldBeTrue(self.stoogesRetrieved[0] !== self.moe && // Make sure not a reference but a copy
      self.stoogesRetrieved[0] !== self.larry && self.stoogesRetrieved[0] !== self.shemp, 'copy');
    var s = []; // get list of names to see if all stooges made it
    for (var i = 0; i < 3; i++) s.push(self.stoogesRetrieved[i].get('name'));
    self.log(s);
    self.shouldBeTrue(contains(s, 'Moe') && contains(s, 'Larry') && contains(s, 'Shemp'));
    // Replace Shemp with Curly
    var didPutCurly = false;
    for (i = 0; i < 3; i++) {
      if (self.stoogesRetrieved[i].get('name') == 'Shemp') {
        didPutCurly = true;
        self.stoogesRetrieved[i].set('name', 'Curly');
        try {
          spec.integrationStore.putModel(self.stoogesRetrieved[i], stoogeChanged);
        }
        catch (err) {
          callback(err);
        }
      }
    }
    if (!didPutCurly) {
      callback(Error("Can't find Shemp!"));
    }
  }
}
// callback after storing changed stooge
function stoogeChanged(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('name') == 'Curly', 'Curly');
  var curly = new self.Stooge();
  curly.set('id', model.get('id'));
  try {
    spec.integrationStore.getModel(curly, storeChangedShempToCurly);
  }
  catch (err) {
    callback(err);
  }
}
// callback after retrieving changed stooge
function storeChangedShempToCurly(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(model.get('name') == 'Curly', 'Curly');
  // Now test delete
  self.deletedModelId = model.get('id'); // Remember this
  spec.integrationStore.deleteModel(model, stoogeDeleted);
}
// callback when Curly is deleted
function stoogeDeleted(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  // model parameter is what was deleted
  self.shouldBeTrue(undefined === model.get('id')); // ID removed
  self.shouldBeTrue(model.get('name') == 'Curly'); // the rest remains
  // Is it really dead?
  var curly = new self.Stooge();
  curly.set('id', self.deletedModelId);
  spec.integrationStore.getModel(curly, hesDeadJim);
}
// callback after lookup of dead stooge
function hesDeadJim(model, error) {
  if (typeof error != 'undefined') {
    if ((error != 'Error: id not found in store') && (error != 'Error: model not found in store')) {
      callback(error);
      return;
    }
  } else {
    callback(Error('no error deleting stooge when expected'));
    return;
  }
  // Skip List test if subclass can't do
  if (!spec.integrationStore.getServices().canGetList) {
    callback(true);
  } else {
    // Now create a list from the stooge store
    var list = new List(new self.Stooge());
    try {
      spec.integrationStore.getList(list, {}, {name: 1}, listReady);
    }
    catch (err) {
      callback(err);
    }
  }
}
// callback after list created from store
function listReady(list, error) {
//          list.sort({name:1});
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  self.shouldBeTrue(list instanceof List, 'is list');
  self.shouldBeTrue(list.length() == 2, 'is 2');
  list.moveFirst();
  self.shouldBeTrue(list.get('name') == 'Larry', 'larry');
  list.moveNext();
  self.shouldBeTrue(list.get('name') == 'Moe', 'moe');
  callback(true);
}
```
<blockquote><strong>log: </strong>a MongoStore MongoStore<br><strong>log: </strong>2<br><strong>log: </strong>2<br><strong>log: </strong>Larry,Shemp,Moe<br>returns <strong>true</strong> as expected
</blockquote>
&nbsp;<b><i>Test variations on getList method.:</i></b>
```javascript
var test = this;
var storeBeingTested = new SurrogateStore();
test.log('storeBeingTested: ' + storeBeingTested);
// Create list of actors
test.actorsInfo = [
  // Actor Born Male Oscards
  ['Jack Nicholson', new Date("01/01/1937"), true, 3],
  ['Meryl Streep', new Date("01/01/1949"), false, 3],
  ['Marlon Brando', new Date("01/01/1924"), true, 2],
  ['Cate Blanchett', new Date("01/01/1969"), false, 1],
  ['Robert De Niro', new Date("01/01/1943"), true, 2],
  ['Judi Dench', new Date("01/01/1934"), false, 1],
  ['Al Pacino', new Date("01/01/1940"), true, 1],
  ['Nicole Kidman', new Date("01/01/1967"), false, null],
  ['Daniel Day-Lewis', new Date("01/01/1957"), true, null],
  ['Shirley MacLaine', new Date("01/01/1934"), false, null],
  ['Dustin Hoffman', new Date("01/01/1937"), true, null],
  ['Jodie Foster', new Date("01/01/1962"), false, null],
  ['Tom Hanks', new Date("01/01/1956"), true, null],
  ['Kate Winslet', new Date("01/01/1975"), false, null],
  ['Anthony Hopkins', new Date("01/01/1937"), true, null],
  ['Angelina Jolie', new Date("01/01/1975"), false, null],
  ['Paul Newman', new Date("01/01/1925"), true, null],
  ['Sandra Bullock', new Date("01/01/1964"), false, null],
  ['Denzel Washington', new Date("01/01/1954"), true, null],
  ['Renée Zellweger', new Date("01/01/1969"), false, null]
];
// Create actor class
test.Actor = function (args) {
  Model.call(this, args);
  this.modelType = "Actor";
  this.attributes.push(new Attribute('name'));
  this.attributes.push(new Attribute('born', 'Date'));
  this.attributes.push(new Attribute('isMale', 'Boolean'));
  this.attributes.push(new Attribute('oscarWs', 'Number'));
};
test.Actor.prototype = inheritPrototype(Model.prototype);
test.actor = new test.Actor(); // instance to use for stuff
// Make sure store starts in known state.  Stores such as mongoStore will retain test values.
// So... use getList to get all Actors then delete them from the Store
test.list = new List(new test.Actor());
test.oldActorsKilled = 0;
test.oldActorsFound = 0;
try {
  test.killhim = new test.Actor();
  storeBeingTested.getList(test.list, [], function (list, error) {
    if (typeof error != 'undefined') {
      callback(error);
      return;
    }
    if (list._items.length < 1)
      storeActors();
    else {
      test.oldActorsFound = list._items.length;
      var testakill = function (model, error) {
        if (++test.oldActorsKilled >= test.oldActorsFound) {
          storeActors();
        }
      };
      for (var i = 0; i < list._items.length; i++) {
        test.killhim.set('id', list._items[i][0]);
        storeBeingTested.deleteModel(test.killhim, testakill);
      }
    }
  });
}
catch (err) {
  callback(err);
}
// callback after model cleaned
// now, build List and add to store
function storeActors() {
  test.actorsStored = 0;
  for (var i = 0; i < test.actorsInfo.length; i++) {
    test.actor.set('ID', null);
    test.actor.set('name', test.actorsInfo[i][0]);
    test.actor.set('born', test.actorsInfo[i][1]);
    test.actor.set('isMale', test.actorsInfo[i][2]);
    storeBeingTested.putModel(test.actor, actorStored);
  }
}
// callback after actor stored
function actorStored(model, error) {
  if (typeof error != 'undefined') {
    callback(error);
    return;
  }
  if (++test.actorsStored >= test.actorsInfo.length) {
    getAllActors();
  }
}
// test getting all 20
function getAllActors() {
  try {
    storeBeingTested.getList(test.list, {}, function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      test.shouldBeTrue(list._items.length == 20, '20');
      getTomHanks();
    });
  }
  catch (err) {
    callback(err);
  }
}
// only one Tom Hanks
function getTomHanks() {
  try {
    storeBeingTested.getList(test.list, {name: "Tom Hanks"}, function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      test.shouldBeTrue(list._items.length == 1, ('1 not ' + list._items.length));
      getD();
    });
  }
  catch (err) {
    callback(err);
  }
}
// 3 names begin with D
// test RegExp
function getD() {
  try {
    storeBeingTested.getList(test.list, {name: /^D/}, function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      test.shouldBeTrue(list._items.length == 3, ('3 not ' + list._items.length));
      getRZ();
    });
  }
  catch (err) {
    callback(err);
  }
}
// Renée Zellweger only female starting name with 'R'
// test filter 2 properties (logical AND)
function getRZ() {
  try {
    storeBeingTested.getList(test.list, {name: /^r/i, isMale: false}, function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      test.shouldBeTrue(list._items.length == 1, ('1 not ' + list._items.length));
      if (list._items.length)
        test.shouldBeTrue(list.get('name') == 'Renée Zellweger', 'rz');
      getAlphabetical();
    });
  }
  catch (err) {
    callback(err);
  }
}
// Retrieve list alphabetically by name
// test order parameter
function getAlphabetical() {
  try {
    storeBeingTested.getList(test.list, {}, {name: 1}, function (list, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      // Verify each move returns true when move succeeds
      test.shouldBeTrue(list.moveFirst(), 'moveFirst');
      test.shouldBeTrue(!list.movePrevious(), 'movePrevious');
      test.shouldBeTrue(list.get('name') == 'Al Pacino', 'AP');
      test.shouldBeTrue(list.moveLast(), 'moveLast');
      test.shouldBeTrue(!list.moveNext(), 'moveNext');
      test.shouldBeTrue(list.get('name') == 'Tom Hanks', 'TH');
      callback(true);
    });
  }
  catch (err) {
    callback(err);
  }
}
```
<blockquote><strong>log: </strong>storeBeingTested: a MongoStore<br>returns <strong>true</strong> as expected
</blockquote>
## [&#9664;](#-mongodb)&nbsp;[&#8984;](#constructors) &nbsp;Summary
This documentation generated with https://github.com/tgicloud/tgi-spec.<br>TODO put testin stats here.    

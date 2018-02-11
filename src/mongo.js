const config = require('../config.json');
const parse = require('parse-duration');
var MongoClient = require('mongodb').MongoClient;
var dburl = config.database.url;
var dbName = config.database.name;
var db;

module.exports = {

  connect: async function( callback ) {
    return new Promise(async function(resolve, reject) {
      console.log('Connecting to database...');
      MongoClient.connect( dburl, function( err, con ) {
        if (err) reject(err);
        db = con.db(dbName);
        console.log('Connected to database.');
        resolve(callback(err));
      });
    });
  },

  assureStores: function assureStores() {
    var stores = config.database.stores;
    stores.forEach(store => assureStore(store));
  },

  scheduleCleanup: function scheduleCleanup() {
    var stores = config.database.stores;
    stores.forEach(s => {
      var cleanup = s.cleanup;
      var interval = s.cleanup.ms_interval;
      setInterval(function(){
        var max = parseTime(cleanup.max_age);
        db.collection(s.name).deleteMany({ timestamp: {$lt: max }}, function(err, res) {
          if (err) throw err;
          var deleted = res.deletedCount;
          if (deleted !== 0)
            console.log('Cleanup: ' + deleted + ' entries deleted for store ' + s.name);
        })}, interval);
      console.log('Cleanup scheduled for store ' + s.name + ' every ' + interval + " ms.");
    });
  },

  addToStore: function addToStore(storeName, entry) {
    entry.timestamp = new Date().toISOString();
    db.collection(storeName).insertOne(entry, function(err, res) {
        if (err) throw err;
    });
  },

  getFromStore: async function getFromStore(storeName, query, time_options) {
    return new Promise(function(resolve, reject) {

      if (time_options !== undefined)
        setTimeOptions(query, time_options);

      db.collection(storeName).find(query).toArray(function(err, res) {
          if (err) throw err;
          delete res.forEach(r => { delete r._id });
          resolve(res);
      });
    });
  }
};

function setTimeOptions(query, time_options) {
  if (time_options.max_age === undefined && time_options.min_age === undefined)
    return;

  if (time_options.field === undefined)
    time_options.field = "timestamp";
  
  var max = parseTime(time_options.max_age);

  if (max === undefined)
    return;

  query[time_options.field] = { $gte: max };
}

function parseTime(duration) {
  var currentMs = +new Date();
  var durationMs = parse(duration);
  return new Date(currentMs - durationMs).toISOString();
}

async function assureStore(store) {
  var name = store.name;
  var exists = await db.listCollections({name: name}).hasNext();
  console.log('Store ' + name + ' exists: ' + exists);

  if (exists) return;

  db.createCollection(name, function(err, res) {
    if (err) throw err;
    console.log("Store " + name + " created.");
  });
}

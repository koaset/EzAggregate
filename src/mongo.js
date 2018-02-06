const config = require('../config.json');
var MongoClient = require('mongodb').MongoClient;
var dburl = config.database.url;
var dbName = config.database.name;
var db;

module.exports = {

  connect: function( callback ) {
    MongoClient.connect( dburl, function( err, con ) {
      console.log('Connecting to database');
      db = con.db(dbName);
      return callback( err );
    });
  },

  assureStores: function assureStores() {
    var stores = config.stores;
    stores.forEach(store => assureStore(store));
  },

  addToStore: function addToStore(storeName, entry) {
    db.collection(storeName).insertOne(entry, function(err, res) {
        if (err) throw err;
        console.log('Entry added to store: ' + entry);
    });
  },

  getAllFromStore: async function getAllFromStore(storeName) {
    return new Promise(function(resolve, reject) {
      db.collection(storeName).find({}).toArray(function(err, res) {
          if (err) throw err;
          delete res.forEach(r => { delete r._id });
          resolve(res);
      });
    });
  }
};

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

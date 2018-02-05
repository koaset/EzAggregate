
var config = require('../config.json');
var MongoClient = require('mongodb').MongoClient;
var dburl = config.database.url;

var _db;

module.exports = {

  connect: function( callback ) {
    MongoClient.connect( dburl, function( err, db ) {
      _db = db;
      return callback( err );
    });
  },

  getDb: function() {
    return _db;
  }
};
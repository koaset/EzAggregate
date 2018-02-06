
var db = require('./mongo');
db.connect( function (err){
    db.assureStores();
});

var api = require('./restApi');
api.start( function (err){

});

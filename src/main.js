main();

async function main(){
    var db = require('./mongo');
    await db.connect( function (err){
        db.assureStores();
    });

    var api = require('./restApi');
    api.start( function (err){

    });
}
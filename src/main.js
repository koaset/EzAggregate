main();

async function main(){
    var db = require('./mongo');
    await db.connect( function (err){
        db.assureStores();
    });

    var mq = require('./rabbitmq');
    mq.start();

    var api = require('./restApi');
    api.start( function (err){

    });
}

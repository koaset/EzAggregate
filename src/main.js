main();

async function main(){
    var db = require('./mongo');
    await db.connect( function (err){
        db.assureStores();
        db.scheduleCleanup();
    });

    var mq = require('./rabbitmq');
    mq.start();

    var api = require('./restapi/restApi');
    api.start( function (err){

    });
}

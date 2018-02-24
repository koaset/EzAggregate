var main = start;
var db;
var mq;
var api;

if (require.main === module) {
    var config = require('../config.json');
    start(config);
}

async function start(config){
    return new Promise(async function(resolve, reject) {
        console.log('Starting application...');
        if (config == null)
            reject("Unable to load config.");
        require('./configStorage').load(config);

        db = require('./mongo');
        mq = require('./rabbitmq');
        api = require('./restapi/restApi');

        await db.connect();
        await db.assureStores();

        var cleanupStart = db.scheduleCleanup();
        var mqStart = mq.start();
        var  apiStart = api.start();

        await mqStart;
        await apiStart;
        await cleanupStart;
        console.log('Startup complete.');
        resolve();
    });
}

function stop(){
    mq.stop();
    api.stop();
    db.stop();
}

module.exports = {
    start: start,
    stop: stop
}
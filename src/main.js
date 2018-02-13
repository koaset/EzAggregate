var main = start;
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

        var db = require('./mongo');
        await db.connect();
        await db.assureStores();

        var cleanupStart = db.scheduleCleanup();
        var mqStart = require('./rabbitmq').start();
        var apiStart = require('./restapi/restApi').start();

        await mqStart;
        await apiStart;
        await cleanupStart;
        console.log('Startup complete.');
        resolve();
    });
}

function stop(){
    process.exit();
}

module.exports = {
    start: start,
    stop: stop
}
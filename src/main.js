var main = start;
if (require.main === module) {
    var config = require('../config.json');
    start(config);
}

async function start(config){
    return new Promise(async function(resolve, reject) {
        if (config === undefined)
            reject("Unable to load config.");
        require('./configStorage').load(config);

        var db = require('./mongo');
        await db.connect( function (err){
            db.assureStores();
            db.scheduleCleanup();
        });

        var mqStart = require('./rabbitmq').start();
        var apiStart = require('./restapi/restApi').start();
        await mqStart;
        await apiStart;
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
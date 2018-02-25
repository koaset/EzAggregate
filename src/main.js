var main = start;
var db;
var mq;
var api;
var log;

if (require.main === module) {
    var config = require('../config.json');
    start(config);
}

async function start(config){
    return new Promise(async function(resolve, reject) {

        try {
            await configureLogger(config);
        }
        catch (err) {
            reject(err);
        }

        log.info('Starting application...');
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
        log.info('Startup complete.');
        resolve();
    });
}

async function configureLogger(config) {
    return new Promise(async function(resolve, reject) {
        var appenders = { main: { type: 'file', filename: config.log.path } };
        if (config.log.to_stdout === true) 
            appenders.console = { type: 'console' }

        var appenderNames = [];
        for(var key in appenders)
            appenderNames.push(key);

        var log4js = require('log4js');
        log4js.configure({
            appenders: appenders,
            categories: { default: { appenders: appenderNames, level: config.log.level } }
        });
        log = log4js.getLogger(require('path').basename(__filename));
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

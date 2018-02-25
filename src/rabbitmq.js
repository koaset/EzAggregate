const amqp = require('amqplib/callback_api');
const db = require('./mongo');
const sourceHelper = require('./sourceHelper');
var config;
var connection;
var log = require('log4js').getLogger(require('path').basename(__filename));

function start(source) {
    return new Promise(function(resolve, reject) {
        config = require('./configStorage').get();

        var sources = config.sources.filter(s => s.type === "rabbitmq");
        
        if (sources.length === 0)
            resolve();

        var connectionString = getConnectionString(config.rabbitmq);

        if (connectionString == null)
            reject("RabbitMQ config missing.");

        amqp.connect(connectionString, function(err, conn) {
            if (err) 
            {
                log.error('Unable to connect to RabbitMQ: ' + err.message);
                throw err.message;
            };
            conn.createChannel(function(err, ch) {
                for (let s of sources)
                    setUpSource(s, ch);
                connection = conn;
                resolve();
            });
        });
    });
}

function stop() {
    if (connection)
        connection.close();
}


function getConnectionString(mqConfig){
    if (mqConfig == null)
        return;
    var ret = 'amqp://';
    if (mqConfig.username != undefined && mqConfig.password != undefined)
        ret += mqConfig.username + ':' + mqConfig.password + '@';
    return ret + mqConfig.url;
}

function setUpSource(s, ch) {
    var queue = s.queue;
    var store = config.database.stores.find(store => store.name === s.store);
    ch.assertQueue(queue, {durable: true});
    if (s.exchange !== undefined)
        ch.bindQueue(queue, s.exchange, s.routing_key);
    ch.consume(queue, function(msg) {
        var json = JSON.parse(msg.content);
        handleMessage(json, store);
    },  {noAck: true});
    log.debug('RabbitMQ source initiated: ' + s.name);
}

function handleMessage(json, store){
    try {
        var entry = sourceHelper.createDbObject(json, store.fields);
        db.addToStore(store.name, entry);
    }
    catch (err) {
        log.error('Error when handling MQ message:' + err);
    }
}

module.exports = {
    start: start,
    stop: stop
}

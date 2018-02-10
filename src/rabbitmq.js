const amqp = require('amqplib/callback_api');
const db = require('./mongo');
const sourceHelper = require('./sourceHelper');
const config = require('../config.json');
module.exports = {
    start: function(source) {
        var sources = config.sources.filter(s => s.type === "rabbitmq");

        amqp.connect(config.rabbitmq.url, function(err, conn) {
            conn.createChannel(function(err, ch) {
                sources.forEach(s => {
                    var queue = s.queue;
                    ch.assertQueue(queue, {durable: true});
                    if (s.exchange !== undefined)
                        ch.bindQueue(queue, s.exchange, s.routing_key);
                    ch.consume(queue, function(msg) {
                        var json = JSON.parse(msg.content);
                        handleMessage(json, s);
                    },  {noAck: true});
                    console.log('RabbitMQ source initiated: ' + s.name);
                });
            });
        });
    }
}

function handleMessage(json, source){
    try {
        var entry = sourceHelper.createDbObject(json, source.fields);
        db.addToStore(source.store, entry);
    }
    catch (err) {
        console.error('Error when handling MQ message:' + err);
    }
}

var expect = require('chai').expect;
var request = require("request");
var main = require('../../src/main');
var config = require('./rabbitmq_source_test_config.json');
var baseUrl = 'http://localhost:' + config.restapi.port + '/';
var log = require('log4js').getLogger(require('path').basename(__filename));

var channel;
var mqConnection;

describe("main tests", function() {

    before(async function(){
        log.info('Starting rabbitmq source test instance...');
        var start = main.start(config);
        await createPublisher();
        await start;
        log.info('Test instance started.\nRunning tests...');
    });

    after(function(){
        log.info('Tests done, closing test instance.');
        mqConnection.close();
        main.stop();
    });

    describe("get -> get after publish", function() {
        var test_user_id = "test_user_1";
        var test_user_bananas = 0;
        var bananas_to_add = 5;

        it ("get returns status 200", function(done){
            request.get(baseUrl + 'api/mqbananas', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                var responseObject = JSON.parse(response.body);
                length = responseObject.length

                var test_user_object = responseObject.find(ro => ro.user_id === test_user_id);
                if (test_user_object != null)
                    test_user_bananas = test_user_object.sum_bananas;

                done();
            });
        });

        it ("get returns extra bananas after publish", function(done){
            publishEntity({ user_id: test_user_id, name: "hej", num_bananas: bananas_to_add });
            
            request.get(baseUrl + 'api/mqbananas', function(error, response, body) {
                var responseObject = JSON.parse(response.body);
                var new_total = responseObject.find(ro => ro.user_id === test_user_id).sum_bananas;
                expect(new_total).to.equal(test_user_bananas + bananas_to_add);
                done();
            });
        });
    });
});

function createPublisher(){    
    return new Promise(async function(resolve, reject) {
        var amqp = require('amqplib/callback_api');
        await amqp.connect('amqp://' + config.rabbitmq.url, function(err, conn) {
        log.debug('Connecting to mq...');
        mqConnection = conn;
        conn.createChannel(async function(err, chan) {
                log.debug('RabbitMQ connected.');
                channel = chan;
                resolve();
            });
        });
    });
}

function publishEntity(entity){
    var routing_key = "banana_key";
    var exchange = "test_exchange";
    channel.publish(exchange, routing_key, new Buffer(JSON.stringify(entity)));
}
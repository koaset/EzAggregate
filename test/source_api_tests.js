var expect = require('chai').expect;
var request = require("request");
var main = require('../src/main');
var config = require('./test_config.json');
var baseUrl = 'http://localhost:' + config.restapi.port + '/';

describe("main tests", function() {

    before(async function(){
        console.log('Starting test instance...');
        await main.start(config);
        console.log('Test instance started.\nRunning tests...');
    });

    after(function(){
        console.log('Tests done, closing test instance.');
        main.stop();
    });

    describe("get sum -> post -> get sum", function() {
        var test_user_id = "test_user_1";
        var test_user_bananas = 0;
        var bananas_to_add = 3;

        it ("get returns status 200", function(done){
            request.get(baseUrl + 'api/bananas', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                var responseObject = JSON.parse(response.body);
                length = responseObject.length

                var test_user_object = responseObject.find(ro => ro.user_id === test_user_id);
                if (test_user_object != null)
                    test_user_bananas = test_user_object.sum_bananas;
                
                done();
            });
        });
    
        it ("post returns status 200", function(done){
            var body = { user_id: test_user_id, name: "hej", num_bananas: bananas_to_add };
            request.post({url: baseUrl + 'api/bananas', body: body, json: true}, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it ("get returns extra bananas after post", function(done){
            request.get(baseUrl + 'api/bananas', function(error, response, body) {
                var responseObject = JSON.parse(response.body);
                var new_total = responseObject.find(ro => ro.user_id === test_user_id).sum_bananas;
                expect(new_total).to.equal(test_user_bananas + bananas_to_add);
                done();
            });
        });
    });
});

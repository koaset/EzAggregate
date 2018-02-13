var expect = require('chai').expect;
var request = require("request");
var baseUrl = 'http://localhost:8080/';

describe("main tests", function() {
    var length;
    describe("get bananas/all", function() {
        it ("returns status 200 and empty list", function(done){
            request.get(baseUrl + 'api/bananas/all', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                var responseObject = JSON.parse(response.body);
                length = responseObject.length
                console.log(length);
                done();
            });
        });
    });

    describe("post bananas", function() {
        it ("returns status 200", function(done){
            var body = { user_id: "test_user_1", name: "hej", num_bananas: 3 };
            request.post({url: baseUrl + 'api/bananas', body: body, json: true}, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    describe("get bananas/all", function() {
        it ("returns extra banana after post", function(done){
            request.get(baseUrl + 'api/bananas/all', function(error, response, body) {
                var responseObject = JSON.parse(response.body);
                expect(responseObject.length).to.equal(length + 1);
                done();
            });
        });
    });
});

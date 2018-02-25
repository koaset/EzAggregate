
describe("Test main", function(){
    importTest('Source API tests', './SourceApi/source_api_tests.js');
    importTest('RabbitMQ tests', './RabbitMQ/rabbitmq_source_tests.js');
});

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

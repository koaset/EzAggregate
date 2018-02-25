const express = require('express');
var server;

async function start() {
    return new Promise(async function(resolve, reject) {
        app = express();
        var bodyParser = require('body-parser');
        app.use(bodyParser.json());

        var config = require('./../configStorage').get();
        var sources = config.sources.filter(s => s.type === "restapi")
        var outputs = config.outputs.filter(s => s.type === "restapi");

        var swaggerUi = require('swagger-ui-express');
        var docGen = require('./swagger/docGenerator');
        var swaggerDocument = docGen.generate(outputs, sources);
        app.use(config.restapi.base_path + '/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        var sourceHelper = require('./sourceHelper');
        sources.forEach(s => sourceHelper.addSource(s, app));
        var outputHelper = require('./outputHelper');
        outputs.forEach(o => outputHelper.addOutput(o, app));

        server = app.listen(config.restapi.port);
        resolve();
    });
}

async function stop() {
    return new Promise(async function(resolve, reject) {
        if (server)
            await server.close();
        resolve();
    });
}

module.exports = {  
    start: start,
    stop: stop
};

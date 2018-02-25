const express = require('express');
var server;
var log = require('log4js').getLogger(require('path').basename(__filename));

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

        var sourceHelper = require('./apiSource');
        sources.forEach(s => sourceHelper.addSource(s, app));
        var outputHelper = require('./apiOutput');
        outputs.forEach(o => outputHelper.addOutput(o, app));

        app.use(errorHandler);

        server = app.listen(config.restapi.port);
        resolve();
    });
}

function errorHandler (err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        res.status(400);
        res.json({ Error: 'Unable to parse JSON.'});
    }
    else if (err.hasOwnProperty('validationErrors')) {
        res.status(400);
        res.json({ Error: err.validationErrors });
    }
    else {
        log.error(err.stack);
        res.status(500);
        res.json({ Error: 'Internal Server Error.' });
    }
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

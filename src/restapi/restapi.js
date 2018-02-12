const config = require('../../config.json');
const express = require('express');

function start() {
    var app = createApp();
    if (config.sources.some(s => s.type === "restapi"))
        require('./sourceApi').start(app, config);
    if (config.outputs.some(s => s.type === "restapi"))
    {
        var swaggerUi = require('swagger-ui-express');
        var docGen = require('./swagger/docGenerator');
        var swaggerDocument = docGen.generateOutputDoc(config.outputs);
        app.use(config.restapi.base_path + '/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        require('./outputApi').start(app, config);
    }
    app.listen(config.restapi.port);;
}  

function createApp() {
    app = express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    return app;
}

module.exports = {  
    start: start
};
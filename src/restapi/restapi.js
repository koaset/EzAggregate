const config = require('../../config.json');
const express = require('express');

module.exports = {  start: function( callback ) {
    if (config.sources.some(s => s.type === "restapi"))
        require('./sourceApi').start(createApp(), config);
    if (config.outputs.some(s => s.type === "restapi"))
    {
        var app = createApp();

        var swaggerUi = require('swagger-ui-express');
        var docGen = require('./swagger/docGenerator');
        var swaggerDocument = docGen.generateOutputDoc(config.outputs);

        app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        require('./outputApi').start(app, config);
    }
  }  
};

function createApp() {
    app = express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    return app;
}

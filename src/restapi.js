const config = require('../config.json');

module.exports = {  start: function( callback ) {
    if (config.sources.some(s => s.type === "restapi"))
        require('./restapi/sourceApi').start(createApp(), config);
    if (config.outputs.some(s => s.type === "restapi"))
        require('./restapi/outputApi').start(createApp(), config);
  }  
};

function createApp() {
    var express = require('express');
    app = express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    return app;
}

const config = require('../config.json');
const express = require('express');

module.exports = {  start: function( callback ) {
    if (config.sources.some(s => s.type === "restapi"))
        require('./restapi/sourceApi').start(createApp(), config);
    if (config.outputs.some(s => s.type === "restapi"))
        require('./restapi/outputApi').start(createApp(), config);
  }  
};

function createApp() {
    app = express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    return app;
}

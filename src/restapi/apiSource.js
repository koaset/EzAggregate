const db = require('../mongo');
const config = require('../configStorage').get();
const sourceHelper = require('../sourceHelper');
var log = require('log4js').getLogger(require('path').basename(__filename));

function addSource(source, app){
    var store = config.database.stores.find(store => store.name === source.store);
    var fullSourcePath = config.restapi.base_path + source.path;
    app.post(fullSourcePath, function(req, res, next) {
        var entry = sourceHelper.createDbObject(req.body, store.fields);
        db.addToStore(store.name, entry);   
        res.send();
        next();
    });
    log.debug("Started source: " + source.name + " @ " + fullSourcePath);
}

module.exports = {  
    addSource: addSource
};

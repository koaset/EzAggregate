const db = require('../mongo');
const config = require('../configStorage').get();

const sourceHelper = require('../sourceHelper');

function addSource(source, app){
    var store = config.database.stores.find(store => store.name === source.store);
    var fullSourcePath = config.restapi.base_path + source.path;
    app.post(fullSourcePath, function(req, res) {
        var entry;
        try {
            entry = sourceHelper.createDbObject(req.body, store.fields);
            db.addToStore(store.name, entry);
        }
        catch (err) {
            console.log(err);
            res.writeHead(400);
        }
        res.end();
    });
    console.log("Started source: " + source.name + " @ " + fullSourcePath);
}

module.exports = {  
    addSource: addSource
};

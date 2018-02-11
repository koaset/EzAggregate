const db = require('.././mongo');
const config = require('../../config.json');
const sourceHelper = require('../sourceHelper');

function start (app, config, callback) {
    var sources = config.sources.filter(s => s.type === "restapi");
    console.log("Starting source rest API.");
    sources.forEach(s => startSource(s, app));
    app.listen(config.restapi.source_port)
    console.log("Source rest API started.");
}  

function startSource(source, app){
    var store = config.database.stores.find(store => store.name === source.store);
    app.post(source.path, function(req, res) {
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
    console.log("Started source: " + source.name + " @ " + source.path);
}

module.exports = {  
    start: start
};

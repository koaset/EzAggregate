const db = require('.././mongo');
const sourceHelper = require('../sourceHelper');

module.exports = {  start: function( app, config, callback ) {
    var sources = config.sources.filter(s => s.type === "restapi");
    console.log("Starting source rest API.");
    sources.forEach(s => startSource(s, app));
    app.listen(config.restapi.source_port)
    console.log("Source rest API started.");
  }  
};

function startSource(source, app){
    
    app.post(source.path, function(req, res) {
        var entry;
        try {
            entry = sourceHelper.createDbObject(req.body, source.fields);
            db.addToStore(source.store, entry);
        }
        catch (err) {
            console.log(err);
            res.writeHead(400);
        }
        res.end();
    });
    console.log("Started source: " + source.name + " @ " + source.path);
}

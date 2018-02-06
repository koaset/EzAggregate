const db = require('.././mongo');

module.exports = {  start: function( app, config, callback ) {
    var sources = config.sources.filter(s => s.type === "restapi");
    console.log("Starting output rest API.");
    sources.forEach(s => startOutput(s, app));
    app.listen(config.restapi.output_port);
    console.log("Output rest API started.");
  }
};

function startOutput(source, app){
    app.get(source.path, async function(req, res) {
        var object;
        try {
            var objects = await db.getAllFromStore(source.store);
            res.json(objects);
        }
        catch (err) {
            console.log(err);
            res.writeHead(500);
        }
        res.end();
    });
}

const db = require('.././mongo');

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
            entry = createDbObject(req.body, source.fields);
            db.addToStore(source.store, entry);
            console.log("Started source: + " + source.name + " @ " + source.path);
        }
        catch (err) {
            console.log(err);
            res.writeHead(400);
        }
        res.end();
    });
}

function createDbObject(body, fields) {

    var entry = {};
    for (var field in fields) {
        var value = body[field];
        validateEntry(fields[field], field, value);
        entry[field] = value;
    }
    return entry;
}

function validateEntry(type, key, value) {
    if (value === undefined)
            throw "Field " + key + " missing or invalid";
    if (type === "string") {
        return; // nothing for now
    }
    else if (type === "number") {
        if (typeof(value) !== "number")
            throw "Invalid value: " + value + ", expected " + type;
        return;
    }
    throw "Invalid type: " + type;
}

var config = require('../../configStorage').get();

var baseDoc = {
    swagger: "2.0",
    info: {
      version: "1.0.0",
      title: getProperty(config.restapi.swagger_name),
      description: "Some aggregator",
    },
    host: "localhost:" + config.restapi.port,
    basePath: config.restapi.base_path,
    consumes: [
      "application/json"
    ],
    produces: [
      "application/json"
    ]
};

function generate(outputs, sources){
    if (outputs.length === 0)
        return;
    var doc = Object.assign({}, baseDoc);

    var paths = {};

    sources.forEach(s => {
        var def = createSourceDefinition(doc, s);
        var ref = s.name + '_model';
        doc.definitions[ref] = def;
        if (paths[s.path] === undefined)
            paths[s.path] = {};
        paths[s.path].post = createSourcePath(s, ref);
    });

    outputs.forEach(o => {
        var def = createOutputDefinition(doc, o);
        var ref = o.name + '_model';
        doc.definitions[ref] = def;
        if (paths[o.path] === undefined)
            paths[o.path] = {};
        paths[o.path].get = createOutputPath(o, ref);
    });

    doc.paths = paths;
    return doc;
}

function createOutputPath(output, def){
    var store = config.database.stores.find(s => s.name == output.store);
    var params = [];

    for (var key in store.fields){
        params.push({
            name: key,
            type: store.fields[key],
            in: 'query'
        });
    }

    return {
        summary: getProperty(output.summary),
        description: getProperty(output.description),
        responses: {
            200: {
                description: "OK",
                schema: def === undefined ? undefined : {
                    "$ref": '#/definitions/' + def
                }
            }
        },
        parameters: params
    };
}

function createSourcePath(source, def){
    return {
        summary: getProperty(source.summary),
        description: getProperty(source.description),
        responses: {
            200: {
                description: "OK"
            },
            400: {
                description: "Bad request!"
            }
        },
        parameters: [
            {
                "in": "body",
                "description": getProperty(source.description),
                "schema": {
                    "$ref": '#/definitions/' + def
                }
            }
        ]
    };
}

function getProperty(p){
    return p !== undefined ? p.toString() : '';
}

function createOutputDefinition(doc, output){
    if (doc.definitions === undefined)
        doc.definitions = {};

    if (output.aggregation === undefined)
    {
        var store = config.database.stores.find(s => s.name == output.store);
        var definition = {};
        definition.properties = {};
        for (var key in store.fields) {
            definition.properties[key] = {
                type: store.fields[key]
            }
        }
        return definition;
    }
    else if (output.aggregation !== undefined)
    {
        var agg = output.aggregation;
        var store = config.database.stores.find(s => s.name == output.store);

        var keyField = agg['key'];
        var aggField = agg['field'];

        return { 
            properties: 
            {
                [keyField]: { type: store.fields[keyField] },
                [agg.name]: { type: store.fields[aggField] }
            }
        };
    }
}

function createSourceDefinition(doc, source){
    if (doc.definitions === undefined)
        doc.definitions = {};

    var store = config.database.stores.find(s => s.name == source.store);
    var definition = {};
    definition.properties = {};
    for (var key in store.fields) {
        definition.properties[key] = {
            type: store.fields[key]
        }
    }
    return definition;
}

module.exports = {
    generate: generate
}


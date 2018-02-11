var config = require('./../../../config.json');

var baseDoc = {
    swagger: "2.0",
    info: {
      version: "1.0.0",
      title: getProperty(config.restapi.swagger_name),
      description: "Some aggregator",
    },
    host: "localhost:8080",
    basePath: "/",
    schemes: [
      "http"
    ],
    consumes: [
      "application/json"
    ],
    produces: [
      "application/json"
    ]
};

function generateSourceDoc(sources){
    return swaggerDoc;
}

function generateOutputDoc(outputs){
    if (outputs.length === 0)
        return;
    var doc = Object.assign({}, baseDoc);

    var paths = {};
    outputs.forEach(o => {
        var def = createDefinition(doc, o);
        var ref = o.name + '_model';
        doc.definitions[ref] = def;
        paths[o.path] = createPath(o, ref);
    });

    doc.paths = paths;
    return doc;
}

function createPath(output, def){
    return {
        get: {
            summary: getProperty(output.summary),
            description: getProperty(output.description),
            responses: {
                200: {
                    description: "OK",
                    schema: def === undefined ? undefined : {
                        "$ref": '#/definitions/' + def
                    }
                }
            }

        }
    };
}

function createDefinition(doc, output){
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
                keyField: { type: store.fields[keyField] },
                [agg.name]: { type: store.fields[aggField] }
            }
        };
    }
}

function getProperty(p){
    return p !== undefined ? p.toString() : '';
}

module.exports = {
    generateOutputDoc: generateOutputDoc,
    generateSourceDoc: generateSourceDoc
}


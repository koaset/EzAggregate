const db = require('.././mongo');
const config = require('../../config.json');
const url = require('url');

function start(app, config, callback) {
    var outputs = config.outputs.filter(s => s.type === "restapi");
    console.log("Starting output rest API.");
    outputs.forEach(o => startOutput(o, app));
}

function startOutput(output, app){
    app.get(config.restapi.base_path + output.path, async function(req, res) {
        var object;
        try {
            var query = url.parse(req.url, true).query;
            var entries = await db.getFromStore(output.store, query, output.time_options);
            var aggregation = aggregate(output.aggregation, entries);
            res.json(aggregation);
        }
        catch (err) {
            console.error(err);
            res.writeHead(500);
        }
        res.end();
    });
}

function aggregate(agg, entries) {
    if (agg === undefined || agg.name === undefined || agg.field === undefined)
        return entries;
    
    if (agg.action === "sum")
        return sum(agg, entries);

    return entries;
}

function sum(agg, entries) {
    if (agg.key === undefined)
        return { [agg.name]: entries.map(e => e[agg.field]).reduce((acc, cur) => acc + cur, 0) };

    entries.sort((e1, e2) => compare(e1, e2, agg.key));
    var summed = sumByKey(agg, entries);

    if (agg.order_by !== undefined)
        summed.sort((e1, e2) => compare(e1, e2, agg.order_by));
    if (agg.invert !== undefined && agg.invert.toString() == "true")
        summed.reverse();
    return summed;
}

function sumByKey(agg, entries){
    var ret = [];
    entries.forEach(e => {
        if (ret.length === 0 || ret[ret.length - 1][agg.key] !== e[agg.key])
            ret.push({ [agg.key]: e[agg.key], [agg.name]: 0 });
        ret[ret.length - 1][agg.name] += e[agg.field];
    });
    return ret;
}

function compare(e1, e2, key) {
    if (e1[key] < e2[key])
      return -1;
    if (e1[key] > e2[key])
      return 1;
    return 0;
}
  
module.exports = {  
    start: start
};

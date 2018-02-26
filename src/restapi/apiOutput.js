const db = require('.././mongo');
const config = require('../configStorage').get();
const url = require('url');
var log = require('log4js').getLogger(require('path').basename(__filename));

function addOutput(output, app){
    app.get(config.restapi.base_path + output.path, async function(req, res, next) {
        try {
            var query = url.parse(req.url, true).query;
            var entries = await db.getFromStore(output.store, query, output.time_options);
            var aggregation = aggregate(output.aggregation, entries);
            res.json(aggregation);
            res.status(200);
            next();
        }
        catch (err) {
            next(err);
        }
    });
}

function aggregate(agg, entries) {
    if (noAggregation(agg))
        return entries.sort((e1, e2) => -compare(e1, e2, "timestamp"));
    
    var result = getAggregation(agg, entries);
    if (result instanceof Array)
        return sortedAggregation(agg, result);
    return result;
}

function getAggregation(agg, entries) {
    switch (agg.action) {
        case "sum":
            return sum(agg, entries);
        case "max":
            return max(agg, entries);
        case "min":
            return min(agg, entries);
        default:
            throw new Error("Non supported aggregation action: " + agg.action);
    }
}

function sortedAggregation(agg, result) {
    if (agg.order_by !== undefined)
        result.sort((e1, e2) => compare(e1, e2, agg.order_by));
    if (agg.invert !== undefined && agg.invert.toString() == "true")
        result.reverse();
    return result;
}

function noAggregation(agg) {
    return agg === undefined || agg.name === undefined || agg.field === undefined;
}

function sum(agg, entries) {
    if (agg.key === undefined)
        return { [agg.name]: entries.map(e => e[agg.field]).reduce((acc, cur) => acc + cur, 0) };

    entries.sort((e1, e2) => compare(e1, e2, agg.key));
    return sumByKey(agg, entries);
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

function max(agg, entries) {
    if (agg.key === undefined)
        return { [agg.name]: Math.max(...entries.map(e => e[agg.field])) };
    entries.sort((e1, e2) => -compare(e1, e2, agg.field));
    var ret = [];
    entries.forEach(e => {
        if (ret.some(r => r[agg.key] === e[agg.key]))
            return;
        ret.push({ [agg.key]: e[agg.key], [agg.name]: e[agg.field] });
    });
    return ret;
}

function min(agg, entries) {
    if (agg.key === undefined)
        return { [agg.name]: Math.min(...entries.map(e => e[agg.field])) };
    entries.sort((e1, e2) => compare(e1, e2, agg.field));
    var ret = [];
    entries.forEach(e => {
        if (ret.some(r => r[agg.key] === e[agg.key]))
            return;
        ret.push({ [agg.key]: e[agg.key], [agg.name]: e[agg.field] });
    });
    return ret;
}
  
module.exports = {  
    addOutput: addOutput
};

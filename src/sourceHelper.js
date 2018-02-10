module.exports = {
    createDbObject: function createDbObject(body, fields) {

        var entry = {};
        for (var field in fields) {
            var value = body[field];
            validateEntry(fields[field], field, value);
            entry[field] = value;
        }
        return entry;
    }
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

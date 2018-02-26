function createDbObject(body, fields) {
    var entry = {};
    var errors = [];

    for (var field in fields) {
        var value = body[field];
        try {
            validateEntry(fields[field], field, value);
        }
        catch (err) {
            errors.push(err.message);
        }
        entry[field] = value;
    }

    if (errors !== undefined && errors.length > 0)
        throw {validationErrors: errors};
    return entry;
}

function validateEntry(type, key, value) {
    if (value === undefined)
            ThrowError(key, 'missing or invalid');
    if (type === "string") {
        if (typeof(value) !== "string")
            ThrowError(key, 'Invalid value: ' + value + ', expected ' + type);
        return;
    }
    else if (type === "number") {
        if (typeof(value) !== "number")
            ThrowError(key, 'Invalid value: ' + value + ', expected ' + type);
        return;
    }
    ThrowError(key, 'Invalid type: ' + type);
}

function ThrowError(key, message) {
    throw new Error('Field ' + key + ', ' + message);
}

module.exports = {
    createDbObject: createDbObject
}
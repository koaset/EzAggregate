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
            throw new Error(errorMessageBase(key) + 'missing or invalid');
    if (type === "string") {
        if (typeof(value) !== "string")
            throw new Error(errorMessageBase(key) + 'Invalid value: ' + value + ', expected ' + type);
        return;
    }
    else if (type === "number") {
        if (typeof(value) !== "number")
            throw new Error(errorMessageBase(key) + 'Invalid value: ' + value + ', expected ' + type);
        return;
    }
    throw new Error(errorMessageBase(key) + 'Invalid type: ' + type);
}

function errorMessageBase(key, message) {
    return 'Field ' + key + ', ';
}

module.exports = {
    createDbObject: createDbObject
}
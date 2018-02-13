var _config;

function load(config) {
    _config = config;
}

function get() {
    return _config;
}

module.exports = {
    load: load,
    get: get
};
'use strict'

const { config } = require('../config');

const getConfig = (req, res) => {
    res.status(200).json(config);
}

module.exports = {
    getConfig
}

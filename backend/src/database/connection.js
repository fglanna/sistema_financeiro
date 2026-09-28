const knex = require('knex');
const knexfile = require('../../knexfile');
const config = require('../config/config');

const environment = config.nodeEnv === 'production' ? 'production' : 'development';
const connection = knex(knexfile[environment]);

module.exports = connection;

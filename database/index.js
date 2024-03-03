const { nodeEnv } = require('../config');
const knexConfig = require('../knexfile');

module.exports = () => {
    try {
        return database = require('knex')(knexConfig[nodeEnv]);
    } catch (error) {
        console.error(`Error -> Database -> Knex, ${error.message}`)
    }
};
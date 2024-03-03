require('dotenv').config()
const { snakeCase } = require('lodash');
const { dbConfiguration } = require("./config");
const { objTransformToCamelCase, transformToCamelCase } = require('./src/utils');

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const postProcessResponse = (result) => {
  if (!result) return result;
  if (Array.isArray(result)) {
    return transformToCamelCase(result);
  } else {
    return objTransformToCamelCase(result);
  }
};

const wrapIdentifier = (value, origImpl) => {
  // lodash.snakeCase removes special chars so we have to except those
  if (['*'].includes(value)) return origImpl(value);
  return origImpl(snakeCase(value));
};

module.exports = {
  development: {
    client: 'sqlite3',
    connection: dbConfiguration.connection,
    useNullAsDefault: true,
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds/development',
    },
    postProcessResponse,
    wrapIdentifier
  },
};

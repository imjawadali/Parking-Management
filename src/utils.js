const {
  mapKeys,
  snakeCase,
  camelCase,
  isArray,
  keys,
  map,
  get,
} = require("lodash");
const assert = require("assert");
const isUUID = require("is-uuid");
const { v4: UUIDv4 } = require("uuid");
const { TimeUnits } = require("./constants/others");

function addPaging(query, paging, defaultLimit) {
  const limit = get(paging, "limit", defaultLimit);
  const offset = get(paging, "offset", 0);

  if (typeof limit !== "undefined") {
    query.limit(limit);
  }
  if (typeof offset !== "undefined") {
    query.offset(offset);
  }

  return query;
}

function transformToSnakeCase(data) {
  const snakeCaseObj = (obj) => {
    const dataWithSnakeCase = mapKeys(obj, (value, key) => snakeCase(key));
    keys(obj).forEach((key) => {
      delete obj[key];
    });

    keys(dataWithSnakeCase).forEach((key) => {
      obj[key] = dataWithSnakeCase[key];
    });

    return obj;
  };

  return isArray(data) ? map(data, snakeCaseObj) : snakeCaseObj(data);
}

function objTransformToCamelCase(obj) {
  mapKeys(obj, (value, key) => {
    const newKey = camelCase(key);
    delete obj[key];
    obj[newKey] = value;
  });
  return obj;
}

function transformToCamelCase(data) {
  assert(isArray(data), "Must be an array of objects");
  return data.map((obj) => objTransformToCamelCase(obj));
}

const uuid = { get: UUIDv4, validate: isUUID.v4 };

const time = {
  now: () => {
    const date = new Date();
    date.setHours(date.getHours());
    return date.toISOString();
  },
  future: (unit, value) => {
    const date = new Date();
    date.setHours(date.getHours());
    switch (unit) {
      case TimeUnits.MINUTES:
        date.setMinutes(date.getMinutes() + value);
        break;
      case TimeUnits.HOURS:
        date.setHours(date.getHours() + value);
        break;
      case TimeUnits.DAYS:
        date.setDay(date.getDay() + value);
        break;
      case TimeUnits.MONTHS:
        date.setMonth(date.getMonth() + value);
        break;
      case TimeUnits.YEARS:
        date.setFullYear(date.getFullYear() + value);
        break;
      default:
        break;
    }
    return date.toISOString();
  },
  past: (unit, value) => {
    const date = new Date();
    date.setHours(date.getHours());
    switch (unit) {
      case TimeUnits.MINUTES:
        date.setMinutes(date.getMinutes() - value);
        break;
      case TimeUnits.HOURS:
        date.setHours(date.getHours() - value);
        break;
      case TimeUnits.DAYS:
        date.setDay(date.getDay() - value);
        break;
      case TimeUnits.MONTHS:
        date.setMonth(date.getMonth() - value);
        break;
      case TimeUnits.YEARS:
        date.setFullYear(date.getFullYear() - value);
        break;
      default:
        break;
    }
    return date.toISOString();
  },
};

module.exports = {
  addPaging,
  transformToCamelCase,
  transformToSnakeCase,
  objTransformToCamelCase,
  uuid,
  time,
};

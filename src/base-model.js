const { addPaging, uuid, transformToSnakeCase } = require('./utils')
const Promise = require('bluebird');
const { itemsPerPage } = require('../config')
const {
    filter,
    isArray,
    partition,
    map,
    extend,
    get,
} = require('lodash');

class BaseModel {
    constructor(db, tableName, context) {
        this.db = db;
        this.tableName = tableName;
        this.context = context;
        this.table = this.db(tableName);
        this._queryHelper = { limit: null, offset: null, query: null };
        this.queryHelper = query => {
            this._queryHelper.query = query;
            return this;
        };
    }

    getAll(paging) {
        const query = this.db(this.tableName);
        return addPaging(query, paging);
    }

    getById(id) {
        if (!id) return id;
        return this.db(this.tableName).where('id', id)
    }

    getByField(field, value, paging) {
        if (field === 'id') return this.getById(value);
        return addPaging(this.db(this.tableName).where(field, value), paging);
    }

    // Save can take an object or array of objects.
    // Each object is inserted or updated depending on if an id field exists
    save(input, tableOverride) {
        const tableName = tableOverride || this.tableName;
        let result;

        const update = (item) =>
            this.db(tableName)
                .where('id', item.id)
                .update(item)
                .then(() => item.id);

        if (isArray(input)) {
            const [updates, inserts] = partition(input, 'id');
            const [deletes, actualUpdates] = partition(updates, 'deleted');

            let itemsWithIds;
            let insertAction = Promise.resolve();

            if (inserts.length > 0) {
                itemsWithIds = map(inserts, (item) =>
                    extend({}, item, { id: uuid.get() })
                );
                insertAction = this.db(tableName)
                    .insert(itemsWithIds)
                    .then(() => {
                        return map(itemsWithIds, (item) => item.id);
                    });
            }

            let deleteIds;
            let deleteAction = Promise.resolve();

            if (deletes.length !== 0) {
                deleteIds = map(deletes, 'id');
                deleteAction = this.deleteWhereIn(deleteIds);
            }

            result = Promise.all([
                insertAction,
                deleteAction,
                Promise.each(actualUpdates, update),
            ]).then(() =>
                map(filter(input, (item) => !item.deleted), (item) =>
                    (item.id ? item.id : itemsWithIds.shift().id)
                )
            );
        } else if (input.id === null || input.id === undefined) {
            const newId = uuid.get();
            input.id = newId;
            result = this.db(tableName)
                .insert(input)
                .then(() => newId);
        } else if (get(input, 'deleted', false)) {
            result = this.db(tableName)
                .where('id', input.id)
                .del();
        } else {
            result = update(input);
        }

        return result || null;
    }

    async addEvent(type, streamType, payload) {
        let localPlayload = {};
        const keys = Object.keys(payload);
        const jobs = [];
        for (let i = 0; i < keys.length; i++)
            if (
                (typeof payload[keys[i]] !== 'object' &&
                    typeof payload[keys[i]] !== 'undefined') ||
                Object.prototype.toString.call(payload[keys[i]]) === '[object Date]' ||
                (payload[keys[i]] !== null &&
                    typeof payload[keys[i]] !== 'undefined' &&
                    Object.prototype.hasOwnProperty.call(
                        payload[keys[i]],
                        '_isAMomentObject'
                    ))
            )
                localPlayload[keys[i]] = payload[keys[i]];
            else if (
                payload[keys[i]] !== null &&
                typeof payload[keys[i]] !== 'undefined'
            ) {
                if (Object.prototype.hasOwnProperty.call(payload[keys[i]], 'sql'))
                    jobs.push({
                        key: keys[i],
                        job: this.db.raw(`SELECT ${payload[keys[i]].sql} AS value`),
                    });
                else localPlayload[keys[i]] = JSON.stringify(payload[keys[i]]);
            } else if (payload[keys[i]] === null) localPlayload[keys[i]] = null;

        await Promise.all(jobs.map(j => j.job)).then(results => {
            results.forEach((result, i) => {
                localPlayload[jobs[i].key] = result.rows[0].value;
            });
        });

        localPlayload = JSON.stringify(transformToSnakeCase(localPlayload)).replace(
            /'/g,
            "''"
        );

        return this.db('event_store').insert(
            transformToSnakeCase({
                type,
                payload: localPlayload,
                streamType,
                streamId: payload.id,
            })
        );
    }

    deleteById(id) {
        return this.db(this.tableName)
            .where('id', id)
            .del();
    }

    async deleteWhereIn(ids, tableOverride) {
        return Promise.all(
            ids.reduce((a, v) => {
                a.push(
                    this.addEvent('deleted', tableOverride || this.tableName, { id: v })
                );
                return a;
            }, [])
        );
    }

    addPaging(paging) {
        this._queryHelper.limit = get(paging, 'limit', itemsPerPage);
        this._queryHelper.offset = get(paging, 'offset', 0);
        this._queryHelper.query
            ?.limit(this._queryHelper.limit)
            .offset(this._queryHelper.offset);
        return this;
    }

    addCounting() {
        this._queryHelper.query.select(
            this.db.raw('count(*) OVER() AS "total_items"')
        );
        return this;
    }

    getQuery() {
        return this._queryHelper.query;
    }

    async resolvePagedQuery() {
        const { limit, offset } = this._queryHelper;
        const results = await this.getQuery();
        const totalItems = results.length ? results[0].totalItems : 0;
        const totalPages = totalItems > 0 ? Math.ceil(totalItems / (limit || 1)) : 0;
        const currentPage = offset ? Math.round(offset / (limit || 1)) + 1 : 1;
        return {
            paging: {
                totalItems,
                totalPages,
                currentPage,
            },
            items: results,
        };
    }

    selectFields(fields, tableName = this.tableName) {
        return this.db(tableName).select(...fields);
    }
}
module.exports = BaseModel;
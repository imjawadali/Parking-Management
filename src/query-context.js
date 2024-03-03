const Cities = require('./modules/Cities')

class QueryContext {
    constructor(db, auth = {}) {
        this.db = db
        this.auth = auth
    }

    get cities() {
        if (this._cities === undefined) {
            this._cities = new Cities(this.db, this);
        }
        return this._cities;
    }
}
module.exports = QueryContext; 
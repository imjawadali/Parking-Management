const ParkingAlocations = require('./modules/ParkingAlocations');
const ParkingSlots = require('./modules/ParkingSlots');

class QueryContext {
    constructor(db, auth = {}) {
        this.db = db
        this.auth = auth
    }

    get parkingSlots() {
        if (this._parkingSlots === undefined) {
            this._parkingSlots = new ParkingSlots(this.db, this);
        }
        return this._parkingSlots;
    }

    get parkingAlocations() {
        if (this._parkingAlocations === undefined) {
            this._parkingAlocations = new ParkingAlocations(this.db, this);
        }
        return this._parkingAlocations;
    }
}
module.exports = QueryContext; 
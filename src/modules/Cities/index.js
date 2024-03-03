const BaseModel = require('../../base-model');

class Cities extends BaseModel {
    constructor(db, context) {
      super(db, 'cities', context);
    }
}
module.exports = Cities;
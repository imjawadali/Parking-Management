const BaseModel = require('../../base-model');
const { SLOT_IN_USE } = require('../../constants/errors');
const { TimeUnits } = require('../../constants/others');
const { time } = require('../../utils');

class ParkingSlots extends BaseModel {
  constructor(db, context) {
    super(db, 'parking_slots', context);
  }

  async getAvailableSlot() {
    return await this.selectFields(['slot_number'])
      .whereNotIn(
        'slot_number',
        this.db
          .select('PS.slot_number')
          .from('parking_slots AS PS')
          .join('parking_alocations AS PA', function () {
            this.on('PA.slot_number', '=', 'PS.slot_number')
              .andOnVal('PA.is_active', '=', 1)
          }, 'left')
      )
      .andWhere('is_under_maintenance', false)
      .first()
  }

  async changeMaintenanceMode(slotNumber, status) {
    const isInUse = await this.context.parkingAlocations
      .selectFields(['id'])
      .where('slot_number', slotNumber)
      .andWhere('is_active', true)
      .first()
    if (isInUse)
      return { error: SLOT_IN_USE }
    await this.table.update({
      isUnderMaintenance: status
    })
      .where('slot_number', slotNumber)
    return { success: true }
  }

  async getAllSlots() {
    return await this.db
      .select('PS.slot_number', 'PS.is_under_maintenance', 'PA.vehicle_number')
      .from('parking_slots AS PS')
      .leftJoin('parking_alocations AS PA', 'PA.id',
        this.db.raw(`
          (SELECT id
            FROM parking_alocations
            WHERE slot_number = PS.slot_number
            AND is_active = 1
            ORDER BY parked_at DESC
            LIMIT 1
          )`
        )
      )
  }

  async getTotalParkingsByDate(date) {
    const nextDate = time.getNextDate(date)
    return await this.db
      .select(
        'PS.slot_number',
        this.db.raw('COUNT(PA.vehicle_number) AS totalVehicles'),
        this.db.raw('SUM(PA.total_minutes) AS totalMinutes'),
        this.db.raw('SUM(PA.amount_charged) AS amountCharged')
      )
      .from('parking_slots AS PS')
      .join('parking_alocations AS PA', function () {
        this.on('PA.slot_number', '=', 'PS.slot_number')
        this.andOnVal('PA.is_active', '=', false)
        this.andOnVal('PA.parked_at', '>=', new Date(date))
        this.andOnVal('PA.parked_at', '<', nextDate)
      }, 'left')
      .groupBy('PS.slot_number')
      .orderByRaw('CAST(PS.slot_number AS decimal)')
  }
}
module.exports = ParkingSlots;
const { perHourRate } = require('../../../config');
const BaseModel = require('../../base-model');
const { VEHICLE_NOT_PARKED } = require('../../constants/errors');
const { time } = require('../../utils');

class ParkingAlocations extends BaseModel {
  constructor(db, context) {
    super(db, 'parking_alocations', context);
  }

  async checkIfCurrentlyParked(vehicleNumber) {
    return await this.selectFields(['slot_number'])
      .where('vehicle_number', vehicleNumber)
      .andWhere('is_active', true)
      .first()
  }

  async unparkCar(vehicleNumber, slotNumber) {
    if (!slotNumber) {
      const isParkedAt = await this.checkIfCurrentlyParked(vehicleNumber)
      if (isParkedAt) slotNumber = isParkedAt.slotNumber
      else return { error: VEHICLE_NOT_PARKED }
    }
    const parkingAllocation = await this.selectFields(['id', 'parked_at'])
      .where('slot_number', slotNumber)
      .andWhere('vehicle_number', vehicleNumber)
      .andWhere('is_active', true)
      .first()
    if (!parkingAllocation)
      return { error: VEHICLE_NOT_PARKED }
    const unparkedAt = time.now()
    parkingAllocation.parkedAt = time.retainUtcConflict(parkingAllocation.parkedAt)
    const totalMinutes = Math.floor(((new Date(unparkedAt) - new Date(parkingAllocation.parkedAt)) / 1000) / 60)
    const duration = time.getHoursAndMinutes(totalMinutes)
    const amountCharged = ((duration.hours + (duration.minutes ? 1 : 0)) || 1) * perHourRate
    this.save({
      id: parkingAllocation.id,
      isActive: false,
      totalMinutes,
      amountCharged,
      unparkedAt
    })
    return { data: { duration, amountCharged } }
  }
}
module.exports = ParkingAlocations;
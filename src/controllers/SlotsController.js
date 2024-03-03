const { INTERNAL_SERVER_ERROR, NO_SLOT_AVAILABLE, VEHICLE_NUMBER_REQUIRED, VEHICLE_ALREADY_PARKED_AT, SOMETHING_WENT_WRONG, SLOT_NUMBER_REQUIRED, STATUS_REQUIRED, DATE_REQUIRED } = require("../constants/errors");
const { VEHICLE_PARKED_AT, MAINTENANCE_MODE_CHANGED } = require("../constants/messages");

async function getAllSlots(req, res) {
    try {
        const data = await req.context.parkingSlots.getAllSlots()
        return res.send({
            status: true,
            data
        })
    } catch (error) {
        console.error(`Error -> Admin -> /getAllSlots, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

async function parkCar(req, res) {
    try {
        const { vehicleNumber } = req.body
        if (!vehicleNumber)
            return res.status(400).send({
                status: false,
                error: VEHICLE_NUMBER_REQUIRED,
            });
        const duplicateEntry = await req.context.parkingAlocations.checkIfCurrentlyParked(vehicleNumber)
        if (duplicateEntry)
            return res.status(400).send({
                status: false,
                error: VEHICLE_ALREADY_PARKED_AT + duplicateEntry.slotNumber,
            });
        const availableSlot = await req.context.parkingSlots.getAvailableSlot()
        if (availableSlot) {
            await req.context.parkingAlocations.save({
                slotNumber: availableSlot.slotNumber,
                vehicleNumber
            })
            return res.send({
                status: true,
                message: VEHICLE_PARKED_AT + availableSlot.slotNumber
            })
        } else {
            return res.status(404).send({
                status: false,
                error: NO_SLOT_AVAILABLE,
            })
        }
    } catch (error) {
        console.error(`Error -> Admin -> /parkCar, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

async function unparkCar(req, res) {
    try {
        const { vehicleNumber, slotNumber } = req.body
        if (!vehicleNumber)
            return res.status(400).send({
                status: false,
                error: VEHICLE_NUMBER_REQUIRED,
            });
        const { data, error } = await req.context.parkingAlocations.unparkCar(vehicleNumber, slotNumber)
        if (data)
            return res.send({
                status: true,
                data
            })
        else
            return res.status(400).send({
                status: false,
                error: error || SOMETHING_WENT_WRONG,
            });
    } catch (error) {
        console.error(`Error -> Admin -> /unparkCar, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

async function changeMaintenanceMode(req, res) {
    try {
        const { slotNumber, status } = req.body
        if (!slotNumber)
            return res.status(400).send({
                status: false,
                error: SLOT_NUMBER_REQUIRED,
            });
        if (typeof status !== 'boolean')
            return res.status(400).send({
                status: false,
                error: STATUS_REQUIRED,
            });
        const { success, error } = await req.context.parkingSlots.changeMaintenanceMode(slotNumber, status)
        if (success)
            return res.send({
                status: true,
                message: MAINTENANCE_MODE_CHANGED
            })
        else
            return res.status(400).send({
                status: false,
                error: error || SOMETHING_WENT_WRONG,
            });
    } catch (error) {
        console.error(`Error -> Admin -> /changeMaintenanceMode, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

async function getTotalParkingsByDate(req, res) {
    try {
        const { date } = req.query
        if (!date)
            return res.status(400).send({
                status: false,
                error: DATE_REQUIRED,
            });
        const data = await req.context.parkingSlots.getTotalParkingsByDate(date)
        return res.send({
            status: true,
            data
        })
    } catch (error) {
        console.error(`Error -> Admin -> /getTotalParkingsByDate, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

module.exports = {
    getAllSlots,
    parkCar,
    unparkCar,
    changeMaintenanceMode,
    getTotalParkingsByDate
};
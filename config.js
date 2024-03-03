const env = process.env

module.exports = {
    port: env.PORT || 8000,
    nodeEnv: env.NODE_ENV || 'development',
    dbConfiguration: {
        connection: {
            filename: env.DB_FILENAME
        }
    },
    noOfSlots: 10,
    perHourRate: 10,
    itemsPerPage: 10,
    timezoneConflict: Number(env.TIMEZONE_CONFLICT || 0)
}
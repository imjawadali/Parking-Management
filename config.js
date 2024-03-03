const env = process.env

module.exports = {
    port: env.PORT || 8000,
    nodeEnv: env.NODE_ENV || 'development',
    dbConfiguration: {
        connection: {
            filename: env.DB_FILENAME
        }
    },
    itemsPerPage: 10
}
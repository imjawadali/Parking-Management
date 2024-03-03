const { INTERNAL_SERVER_ERROR } = require('../constants/errors')
const QueryContext = require('../query-context')
const { time } = require('../utils')
const db = require('../../database')()

async function contextMiddleware(req, res, next) {
    try {
        console.log('Time:', time.now())
        console.log({ url: req.url, method: req.method })
        await db.raw("SELECT 1")
        req.context = new QueryContext(db)
        next()
    } catch (error) {
        console.error(`Error -> contextMiddleware, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

let shuttingDown = false;

const gracefulShutdown = async () => {
    if (shuttingDown) return true;
    shuttingDown = true;
    console.log(`Graceful Shutdown >`);
    await db.destroy();
    return true;
}

process.on('SIGINT', async () => {
    await gracefulShutdown();
    shuttingDown = false;
    process.exit(0);
})

module.exports = {
    contextMiddleware
}
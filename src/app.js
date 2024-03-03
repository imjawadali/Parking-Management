const express = require('express')
const cors = require('cors')
const routes = require('./routes')

function getApp() {
    const app = express()
    app.use(cors({
        origin: true,
        methods: ['GET', 'POST', 'PUT'],
        allowedHeaders: ['Content-Type'],
        credentials: false
    }));
    app.use(express.json({ limit: '1gb' }));
    app.use(routes);

    return app
}

module.exports = {
    getApp
}
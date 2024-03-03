const express = require('express');
const router = express.Router();
const appRoutes = require('./appRoutes');
const { contextMiddleware } = require('../middlewares/contextMiddleware');

router.use(contextMiddleware)

router.use('/app', appRoutes)

module.exports = router;
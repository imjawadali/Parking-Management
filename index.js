require('dotenv').config()
const { port } = require('./config');
const { getApp } = require('./src/app');

const app = getApp()
app.listen(port, () => console.log(`listening on port: ${port}`))
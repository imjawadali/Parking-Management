const { INTERNAL_SERVER_ERROR } = require("../constants/errors");

async function test(req, res) {
    try {
        return res.send({
            status: true
        })
    } catch (error) {
        console.error(`Error -> Admin -> /getRoles, ${error.message}`)
        return res.status(500).send({
            status: false,
            error: INTERNAL_SERVER_ERROR,
        })
    }
}

module.exports = {
    test
};
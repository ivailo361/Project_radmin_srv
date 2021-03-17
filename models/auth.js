const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const MongoDB = require("./mongo");
const db = new MongoDB();

async function authUser(req, res, next) {
    try {
        const { authorization } = req.headers
        if (authorization === undefined || authorization === 'null') {
            throw new Error('You must be login in order to get the info')
        }
        const { token, type } = JSON.parse(authorization) 
        const decodedToken = jwt.verify(token, config.db_secret);
        const { email } = decodedToken
        const user = await db.getData('users', { email, type })
        if (user.length === 1) {
            req.type = type
            next()
        } else {
            throw new Error('You do not have rights to do this!')
        }
        
    }
    catch (e) {
        // req.respond = 'Your session has expired please login again'
        // let respond = 'Your session has expired please login again'
     
        next(e)
        // res.render('loginPage', { respond })
    }
}

function checkAdminType(req, res, next) {
    if (req.type !== 'admin') {
        throw new Error('You do not have enough rights to proceed')
    }
    next()
}

function generateToken(payload, options) {
    return jwt.sign(payload, config.db_secret, options)
}

function decodeToken(token) {
    const decodedToken = jwt.verify(token, config.db_secret);
    return decodedToken
    // { name, description, url, difficultyLevel}
}

module.exports = {
    authUser,
    checkAdminType,
    generateToken,
}
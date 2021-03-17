const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config')[env];
const bcrypt = require('bcrypt');
const { generateToken } = require('../../models/auth')
const UserExceptionError = require('../../models/userException')

const MongoDB = require("../../models/mongo");
const db = new MongoDB();

async function getInitialData(req, res, next) {
    try {
        console.log('I am here')
        const getData = await Promise.all([db.getData('servers'), db.getData('types')])
        const result = [...getData[0], ...getData[1]]
        if (result.length === 0) {
            throw new UserExceptionError(404, 'Sorry, we cannot find that!')
        }
        res.status(200).json(getData)
    }
    catch (e) {
        next(e)
    }
}

async function deleteComponents(req, res, next) {
    try {
        let body = req.body;

        console.log(body)
        let result = await db.deleteComponents('components', body)
        let response = {deletedComponents: result}
        res.status(200).json(response)
    }
    catch (e) {
        let error = new UserExceptionError(400, 'The delete operation can\'t be completed')
        // res.status(400).json('The delete operation can\'t be completed')
        next(error)
    }
}

async function register(req, res, next) {
    try {
        const { email, password, } = req.body;
        const salt = config.db_saltRounds
        const hashed = await bcrypt.hash(password, salt)
        const result = await db.insertUser('users', { email, password: hashed, type: 'guest' })
        if (result.insertedCount === 0) {
            throw new UserExceptionError(404, 'The user has already existed')
   
        }
        const response = {insertedCount: 1, user: email}
        res.status(200).json(response)
    }
    catch (e) {
        next(e)
    }
}

async function login(req, res, next) {
    try {
        console.log(req.body)
        const { email, password } = req.body;
        const user = await db.getData('users', { email })
        const { password: pass, type } = user[0]

        if (user.length === 0) {
            throw new UserExceptionError(401, 'Invalid user')
        }
        const isMatched = await bcrypt.compare(password, pass ? pass : '')
        if (!isMatched) {
            throw new UserExceptionError(401, 'Invalid password')
        }
        const token = generateToken({ email }, { expiresIn: '200m' })
        const response = {login:'ok', user: email, token, type}
    
        res.status(200).json(response)

    }
    catch (e) {
        next(e)
    }
}


module.exports = {
    getInitialData,
    deleteComponents,
    register,
    login,
}
const stock = require('./stock');
const router = require('express').Router();
const { authUser } = require('../../models/auth')
// const validate= require('../../models/validator');


router.get('/', authUser, stock.getInitialData);

router.delete('/delete', stock.deleteComponents)

router.post('/register', stock.register);

router.post('/login', stock.login);

// router.post('/register', user.post.register);
// // router.post('/register', validate.registerInput('users'), user.post.register);

// router.post('/login', user.post.login);

// router.post('/logout', user.post.logout);

// router.put('/:id', user.put);

// router.delete('/:id', user.delete);

module.exports = router;
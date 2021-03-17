const express = require('express');
const router = express.Router()
const page = require('../controllers/controller')
const errorHandle = require('../model/errorHandler')
const validate= require('../model/validator');
const { authUser } = require('../model/auth')
const isPrivet  = require('../model/pageStatus')


router.get('/', authUser, page.get.homePage, errorHandle('home'));

router.get('/register', authUser, isPrivet('false'), page.get.registryPage, errorHandle('home'));
router.post('/register', authUser, validate.registerInput('users'), page.post.registryPage, errorHandle('register'));

router.get('/login', authUser, isPrivet('false'), page.get.loginPage, errorHandle('home'))
router.post('/login', authUser, validate.loginInput('users'), page.post.loginPage, errorHandle('login'))
router.get('/logout', authUser, isPrivet('true'), page.get.logoutPage, errorHandle('home'))

router.get('/course/create', authUser, isPrivet('true'), page.get.createCoursePage, errorHandle('home'))
router.post('/course/create', authUser, validate.courseInput('course'), page.post.createCoursePage, errorHandle('home'))

router.get('/course/details/:id', authUser, isPrivet('true'), page.get.courseDetails, errorHandle('home'))

router.get('/course/details/:id/enroll/:title', authUser, isPrivet('true'), page.get.enrollUser, errorHandle('home'))

router.get('/course/delete/:id/:title', authUser, isPrivet('true'), page.get.deleteCourse, errorHandle('home'))

router.get('/course/edit/:id', authUser, isPrivet('true'), page.get.editCourse, errorHandle('home'))
router.post('/course/edit/:id', authUser, validate.courseInput('course'), page.post.editCourse, errorHandle('home') )

router.post('/search', authUser, page.get.searchBox, errorHandle('home') )


router.all('*', authUser, (req, res) => {
    let loggedIn = req.user || false
    res.render('404', { loggedIn })
});


module.exports = router
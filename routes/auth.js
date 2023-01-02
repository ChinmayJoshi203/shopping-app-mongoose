
const express= require('express')

const router= express.Router()
const User=require('../models/user')

const authController=require('../controllers/auth')

const { check,body }=require('express-validator/check')

router.get('/login', authController.getLogin)

router.post('/login', authController.postLogin)

router.post('/logout',authController.postLogout)

router.get('/signup', authController.getSignUp)

router.post('/signup', [check('email')
.isEmail()
.withMessage('Please enter a valid email.')
.normalizeEmail()
.custom((value,{req})=>{
   return User.findOne({ email: value })
    .then((userDoc) => {
      if (userDoc) {
       return Promise.reject('Email already exists')
      }})
}),
body('password','Please enter a valid password')
.isLength({min: 5})
.isAlphanumeric()
.trim(),
body('confirmPassword','Passwords dont match')
.custom((value,{req})=>{
    if(value!== req.body.password)
    {
        throw new Error(`Passwords don't match`)
    }
    return true
}).trim()

],authController.postSignUp)

router.get('/reset',authController.getResetPassword)

router.post('/reset',authController.postResetPassword)

router.get('/reset/:token',authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)
module.exports=router
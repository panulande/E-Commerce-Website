const express = require('express');

const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');


const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email').custom((value, {req})=>{

    return User.findOne({ email: value })
    .then(user => {
      if (!user) {
        return Promise.reject('Invalid Username');
      }
    }
)

}),
body('password', 'Please enter a password with only numbers and text and at lease 5 characters').isLength({min:5}).isAlphanumeric(),

],authController.postLogin);

router.post('/signup', [check('email').isEmail().withMessage('Please enter a valid email').custom((value, {req})=>{

    return User.findOne({ email: value })
    .then(userDoc => {
    if (userDoc) {
        return Promise.reject("User Already Exists");
    }
})
    return true;

}),body('password', 'Please enter a password with only numbers and text and at lease 5 characters').isLength({min:5}).isAlphanumeric(), body('confirmPassword').custom((value, {req})=>{
    if(value !== req.body.password){
        throw new Error("Passwords are not the same");
    }
    return true;
})] ,authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);
module.exports = router;
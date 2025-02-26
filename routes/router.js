const express = require('express')
const userController = require('../controllers/userController')

const router = new express.Router() //creating object for express

// http://localhost:3000/register
router.post("/register", userController.signUp);

// http://localhost:3000/resendotp
router.post("/resendotp", userController.resendOtp);

// http://localhost:3000/otpverification
router.post("/otpverification", userController.otpVerification);

// http://localhost:3000/login
router.post("/login", userController.login);


// http://localhost:3000/google-login
// router.post("/google-login", userController.googleLogin);

module.exports = router   





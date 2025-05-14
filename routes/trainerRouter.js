const express = require('express')
const trainerController = require('../controllers/trainerController')
const jwtMiddleware=require('../middlewares/jwtMiddleware')


const router = new express.Router() //creating object for express

// http://localhost:3000/trainerlogin
router.post("/trainerlogin", trainerController.login);




module.exports = router   


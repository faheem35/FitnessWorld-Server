const express = require('express')
const adminController = require('../controllers/adminController')
const workoutController = require('../controllers/workoutController')
const jwtMiddleware=require('../middlewares/jwtMiddleware')
const multerMiddleware = require('../middlewares/multerMiddleware')

const router = new express.Router() //creating object for express

// http://localhost:3000/adminlogin
router.post("/adminlogin", adminController.login);

// http://localhost:3000/adminAddWorkout
router.post("/adminAddWorkout", multerMiddleware.single('workoutImg'), workoutController.addWorkoutController);


//all-workouts: http://localhost:3000/all-workouts
router.get('/all-workouts',workoutController.allWorkoutsController)


//workouts/id/edit: http://localhost:3000/workouts/id/remove
router.delete('/workouts/:id/remove',workoutController.removeWorkoutController)


//workouts/10/edit: http://localhost:3000/workouts/id/edit
router.put('/workouts/:id/edit',multerMiddleware.single('workoutImg'),workoutController.editWorkoutController)

//userlist: http://localhost:3000/userlist
router.get('/userlist',adminController.fetchUser)


//useredit: http://localhost:3000/useredit/id
router.patch('/useredit/:id',adminController.editUser)

module.exports = router   





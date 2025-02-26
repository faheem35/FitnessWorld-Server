const mongoose = require('mongoose')

const workoutSchema= new mongoose.Schema({
          muscleName:{
                    type:String,
                    required:true,
                    
          },
          workoutName:{
                    type:String,
                    required:true,
                    unique:true
                    
          },
          count:{
                    type:String,
                    required:true
          },
          workoutImg:{
                    type:String,
                    required:true,
          },
          tutorialLink:{
                    type:String,
                    required:true
          }

})

const workouts= mongoose.model("workouts",workoutSchema)

module.exports = workouts
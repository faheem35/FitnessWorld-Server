const workouts=require("../models/workoutModel")

//add workout
exports.addWorkoutController =async (req,res)=>{

          console.log("inside addWorkoutController");

          const {muscleName,workoutName,count,tutorialLink}=req.body
          const workoutImg=req.file.filename
          console.log(muscleName,workoutName,count,tutorialLink,workoutImg)

          try{
                    const existingWorkout = await workouts.findOne({workoutName})
                    if(existingWorkout){
                              res.status(406).json("Workout already exist in our collection.... please upload another one!!!")

                    }else{   //store in mongodb atlas
                              const newWorkout = new workouts({
                                        muscleName,workoutName,count,tutorialLink,workoutImg
                              })
                              await newWorkout.save()
                              res.status(200).json(newWorkout)
                    }

          }catch(err){
                    res.status(401).json(err)
          }
          
        //    res.status(200).json("Register request recieved") //to test in postman
         
          
}

//get all Workouts for admin panel show
exports.allWorkoutsController =async (req,res)=>{

          const searchkey = req.query.search
          console.log(searchkey);
      
          console.log("inside allWorkoutsController");
      
          const query={
              workoutName:{
                              $regex:searchkey,$options:'i'
                    }
          }
         
         try{
                    const allWorkouts = await workouts.find(query)
                    res.status(200).json(allWorkouts)
      
          }catch(err){
                    res.status(401).json(err)
          }          
      }

      //removeWorkout 
exports.removeWorkoutController=async(req,res)=>{
          console.log("inside removeWorkoutController");
          const {id}= req.params
          try{
                    const deleteWorkout = await workouts.findByIdAndDelete({_id:id})
                    res.status(200).json(deleteWorkout)

          }catch(err){
                    res.status(401).json(err)
          }

          
}


      //editWorkout
      exports.editWorkoutController =async (req,res)=>{

        console.log("inside editWorkoutController");
        const id= req.params.id
        
        const{muscleName,workoutName,count,tutorialLink,workoutImg}= req.body
        const reUploadWorkoutImg = req.file? req.file.filename : workoutImg
    
        
       try{
        const updateWorkout = await workouts.findByIdAndUpdate({_id:id},{muscleName,workoutName,count,tutorialLink,workoutImg:reUploadWorkoutImg},{new:true})
        await updateWorkout.save()
        res.status(200).json(updateWorkout)
                 
    
        }catch(err){
                  res.status(401).json(err)
        }          
    }

    //get all Workouts for user show
exports.allWorkoutsForUserController =async (req,res)=>{



  console.log("inside allWorkoutsForUserController");


 
 try{
            const allWorkouts = await workouts.find()
            res.status(200).json(allWorkouts)

  }catch(err){
            res.status(401).json(err)
  }          
}



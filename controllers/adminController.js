const users = require("../models/userModel")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const workouts = require("../models/workoutModel");


const login = async (req, res) => {
          const { email, password } = req.body;
      
          try {
              
      
              // Check if the user exists and is an admin
              const user = await users.findOne({ email: email, isAdmin: 1 });
              if (!user) {
                  return res.status(400).json({ message: "No admin found" });
              }
      
              // Validate password
              const passwordVerify = await bcrypt.compare(password, user.password);
              if (!passwordVerify) {
                  return res.status(400).json({ message: "Invalid password" });
              }
      
              // Generate access and refresh tokens
              const token = jwt.sign(
                  { email: user.email, isAdmin: user.isAdmin },
                  process.env.ADMIN_ACCESS_TOKEN_KEY,
                  { expiresIn: '1h' }
              );
      
              const refreshToken = jwt.sign(
                  { email: user.email, isAdmin: user.isAdmin },
                  process.env.ADMIN_REFRESH_TOKEN_KEY,
                  { expiresIn: '7d' }
              );
              //  console.log("Acess Tokens:",token)
              //  console.log("refresh token:",refreshToken)
              // Set the refresh token in a cookie
              res.cookie('refreshToken', refreshToken, {
                  httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
                  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              });
      
              // Respond with the access token and user details
              return res.status(200).json({
                  message: 'Admin logged in successfully',
                  token,
                  user: {
                      id: user._id,
                      email: user.email,
                      name: user.name,
                      isAdmin: user.isAdmin,
                  },
              });
          } catch (error) {
              console.error('Admin login failed:', error);
              return res.status(500).json({ message: "Internal Server Error" });
          }
      };

// //get all Workouts
// allWorkoutsController =async (req,res)=>{

//     const searchkey = req.query.search
//     console.log(searchkey);

//     console.log("inside allWorkoutsController");

//     const query={
//         workoutName:{
//                         $regex:searchkey,$options:'i'
//               }
//     }
   
//    try{
//               const allWorkouts = await workouts.find(query)
//               res.status(200).json(allWorkouts)

//     }catch(err){
//               res.status(401).json(err)
//     }          
// }

// //editWorkouts
// editWorkoutController =async (req,res)=>{

//     console.log("inside editWorkoutController");
//     const id= req.params.id
    
//     const{muscleName,workoutName,count,tutorialLink,workoutImg}= req.body
//     const reUploadWorkoutImg = req.file? req.file.filename : workoutImg

    

   
//    try{
//     const updateWorkout = await projects.findByIdAndUpdate({_id:id},{muscleName,workoutName,count,tutorialLink,workoutImg:reUploadWorkoutImg},{new:true})
//     await updateWorkout.save()
//     res.status(200).json(updateWorkout)
             

//     }catch(err){
//               res.status(401).json(err)
//     }          
// }

module.exports = { 
 login,  
//  allWorkoutsController,
//  editWorkoutController,

 };
      
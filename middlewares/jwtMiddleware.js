const jwt = require('jsonwebtoken')

const jwtMiddleware = (req,res,next)=>{
          console.log("inside middleware");
          const token= req.headers['authorization'].split(" ")[1]
          console.log(token);
          if(token!=''){
                    //token verification(authorization)
                    try{
                              const jwtResponse = jwt.verify(token,process.env.JWTPASSWORD)  //it gives userId , iat datas
                               console.log(jwtResponse);
                               req.userId= jwtResponse.userId
                               
                    }catch(err){
                              res.status(401).json("Authorization failed... please Login")

                    }
                    

          }else{
                    res.status(404).json("Authorization failed.. Token is Missing....!!")
          }

          next()
}

module.exports = jwtMiddleware



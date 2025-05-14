require('dotenv').config() //imports .env file and give it in to process.env
const express = require('express') //importing express
const cors = require('cors')     //importing cors
const router =require("./routes/router")
const adminRouter = require("./routes/adminRouter")
const trainerRouter = require("./routes/trainerRouter")
require("./database/dbConnection")

const cookieParser = require("cookie-parser")


const faserver= express()  //creating express server

faserver.use(cors()) //using cors
faserver.use(express.json())  //using express.json()
faserver.use(router)
faserver.use(adminRouter)
faserver.use(trainerRouter)
faserver.use('/uploads', express.static('./uploads'))
faserver.use(cookieParser())

const PORT= 3000 || process.env.PORT //setting port for run

faserver.listen(PORT,()=>{     //listen section
          console.log(`My faserver is ruuning in port: ${PORT} and waiting for client request!!!`);
})

faserver.get('/',(req,res)=>{  //req means request, res means result 
          res.status(200).send('<h1 style="color:red;">My faserver is ruuning in port and waiting for client request!!!</h1>')
})

faserver.post('/',(req,res)=>{
          res.status(200).send("POST request")
})
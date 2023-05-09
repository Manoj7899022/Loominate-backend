const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require('dotenv')
const userRouter = require('./Router/UserRouter.js')
const cors = require('cors')

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
        .then(()=> console.log("DB connection successfull"))
        .catch(err => console.log(err.message))

app.use(express.json())
app.use(cors())

// app.get('/', (req,res )=> res.send("hello world"))

app.use('/auth',userRouter)

app.listen(process.env.PORT, ()=> console.log('Listening on port 8000'))
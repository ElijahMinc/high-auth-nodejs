require('dotenv').config()

const express= require('express');
const mongoose = require('mongoose')
const cors= require('cors');
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./src/middleware/error.middleware')
const routes = require('./src/routes/index')
const app = express();



app.use(express.json());
app.use(cookieParser());
app.use(cors({
   credentials: true, //
   origin: process.env.CLIENT_URL,
   sameSite: 'None',
}));
app.use('/api', routes)
app.use(errorMiddleware)

const start = async () => {
   try {
      await mongoose.connect(process.env.DB_URL)
      await app.listen(process.env.PORT, () => console.log(`Server started on ${process.env.PORT}`))
   } catch (e) {
      console.log(e) 
   }
}


start()
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('connected to database successfully');
    }catch(error){
        console.log('error connecting to database',error.message);
    }
    }

module.exports = connectDB;
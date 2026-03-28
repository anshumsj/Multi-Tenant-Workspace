const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:{value:true,message:"email should be in lowercase"},
        index:true,
        emailRegex:{value : /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ , message:"please enter a valid email address"}
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    avatar:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    },
    lastLoginAt:{
        type:Date
    }
    },
    {timestamps:true }
)

const User = mongoose.model('User',userSchema);
module.exports = User;
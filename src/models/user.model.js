import mongoose, {Schema} from "mongoose";

import jwt from "jsonwebtoken";

import bcrypt from 'bcrypt';

const userSchema = new Schema({

    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true//for searching index have to be true
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type: String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type: String,//use cloudnary url
        required:true
    },
    coverImage:{
        type: String,//use cloudnary url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required'],

    },
    refreshToken:{
        type:String

    }

},{timestamps:true})


// ###hooks
//this is pre hook before save user data it will encrypt user password
// agar password change kar rh hia means like change password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();//check if password modify then hi bcryt hoga password before save
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
// we can create method by schema
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            // expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            expiresIn:1000
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            // expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            expiresIn:100000
        }
    )
}


export const User = mongoose.model("User",userSchema)
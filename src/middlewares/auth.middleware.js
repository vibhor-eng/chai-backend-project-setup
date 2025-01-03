import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//middleware me 3 cheez req,res,next
export const verifyJWT = asyncHandler(async(req,res,next) => {
    try{
        // we can get cookie here becuase  cookie parser add kiya hua app.js me
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }

        //get data from access token jo hmne model me dala hai
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password, -refreshToken")
        if(!user){
            //todo: discuss about frontend
            throw new ApiError(401,"Invalid accessToken")
        }

        req.user = user;//add user details in request object
        next()
    }
    catch(err){
        throw new ApiError(401, err?.message || "Invalid access token")
    }
})
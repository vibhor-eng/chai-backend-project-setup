import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => 
{

    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
       
        const refreshToken = user.generateRefreshToken()
        

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})//save refresh token validateBeforeSave is false because many field required in model so validate fail

        return {accessToken, refreshToken}

    }catch(error){
        console.log("errr",error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }

}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })
    //steps to register
    /*
        get user details from frontend
        validation on fields
        check if user already exist
        check for images, check for avatar
        upload them to cloudinary
        create user object - create entry in db
        remove password and refres token field from response
        check for user creation
        return res
    */

        const {fullName, email, username, password} = req.body
        console.log("fullName: ",fullName)
        // single single param check
        // if(fullName === ''){
        //     throw new ApiError(400, "Full Name is required")
        // }

        // all parameter check once empty
        if([fullName, email, username, password].some((field) => 
            field?.trim() === "")
        ){
            throw new ApiError(400, "All fields are required")
        }

        // User.findOne({email})
        // or
        const existedUser = await User.findOne({
            $or: [{ username },{ email }] //check email or username
        })

        if(existedUser){
            throw new ApiError(409, "User with email or username is already exist")
        }
        //get path of image file
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // in case cover image not upload comment below line
        // const coverImageLocalPath = req.files?.coverImage[0]?.path

        // this case cover image sent or not
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar is required")
        }

        // image upload on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)

        
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400, "Avatar is required")
        }

        const user = await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",//if cover image exist then fetch url otherwise empty
            email,
            password,
            username: username.toLowerCase()

        })

        const CreatedUsers = await User.findById(user._id).select("-password -refreshToken")

        if(!CreatedUsers){
            throw new ApiError(500, "Something went wrong when reguistering a user")
        }

        return res.status(201).json(
            new ApiResponse(200,CreatedUsers,"User Registered.")
        )

} )

// login api
const loginUser = asyncHandler(async (req,res) => {
    //req body => data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password} = req.body
    
    if(!username && !email){
        throw new ApiError(400, "username or email is required.")
    }

    const user = await User.findOne({
        $or:[{username},{email}] //find by email or username
    })

    //### findOne ye sab User modal k pass hai but jo custom method hai jaise isPasswrdCorret ye user k pass jai
    if(!user){
        throw new ApiError(404, "user does not exist.")
    }

    const isPassValid = await user.isPasswordCorrect(password) //paasword req.body vaala upar

    if(!isPassValid){
        throw new ApiError(401, "Password Incorrect.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)//get both variable.

    //again find query because save refresh token fetch karna padega
    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")//ye nhi chahiye

    // send cookie data
    // http only and secure true menas aap isko server side se modify kar skte ho
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Loggedin"
        )
    )


})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:
            {
                refreshToken:undefined
            }
        },{
            new:true//new updated value mil jayegi
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    //verify means jo milkar hmne refresh token bnaya tha vo data hum nikal skte hai

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET

    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    // jo save hua aur jo bheja compare
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used.")
    }

    const options = {
        httpOnly:true,
        secure:true
    }

    const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:accessToken,newrefreshToken
            },
            "Access Token refreshed"
        )
    )


})


const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
console.log(req.user?._id)
console.log(oldPassword)
console.log(newPassword)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword;//update password in user table
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {

    return res.status(200)
    .json(new ApiResponse(200,req.user,"User fetched successfully."))//ye middleware se aa rha hai hmara uth middlwware me req.user me user daal dete hai

})


const updateAccountDetails = asyncHandler(async(req,res) => {

    // kya kya update karvana chahate hai

    const {fullName, email} = req.body
    if(!fullName && !email){
        throw new ApiError(400,"All fields are required.")
    }

    //id from middleware
    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select('-password')

    return res.status(200)
    .json(new ApiResponse(200,"updated successfully."))

})


const updateUserAvatar = asyncHandler(async(req,res) => {

    const avatarLocalPath = req.file?.path//get from multer middleware
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}//return the update value
    ).select('-password')//remove password from response

    return res.status(200)
    .json(new ApiResponse(200,user,"updated avatar successfully."))

})

const updateUserCoverImage = asyncHandler(async(req,res) => {

    const coverLocalPath = req.file?.path//get from multer middleware
    if(!coverLocalPath){
        throw new ApiError(400,"Cover file is missing")
    }

    const cover = await uploadOnCloudinary(coverLocalPath)
    if(!cover.url){
        throw new ApiError(400,"Error while uploading on cover")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:cover.url
            }
        },
        {new:true}//return the update value
    ).select('-password')//remove password from response

    return res.status(200)
    .json(new ApiResponse(200,user,"updated cover successfully."))

})

const getUserChannelProfile = asyncHandler(async(req,res) => {

    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    // yha hmne user aur Subscription table me join lgaya hai aur nikala hai kitne subscriber hai hmare aur hmne kitno ko subscribe kiya hai/
    const channel = await User.aggregate(
        [
            {
                $match:{
                    username:username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"Subscription",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"Subscription",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribeedTo"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size:"$subscriber"
                    },
                    channelsSubscriberToCount:{
                        $size:"$subscribeedTo"
                    },
                    isSubscribed:{
                        $cond:{
                            if:{$in: [req.user?._id,"$subscriber.subscriber"]},
                            then:true,
                            else:false
                        }
                    }
                }
            },
            {
                //here jo field hum return kar rhe hai
                $project:{
                    fullName:1,//means get full name
                    username:1,
                    subscribersCount:1,
                    channelsSubscriberToCount:1,
                    avatar:1,
                    email:1,
                    coverImage:1

                }
            }
        ]
    )

    if(!channel?.length){
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"User Channel fetched successfully."))

})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([

        {

            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)//get id with object if write simple req/user._id then by mongoose we get simple _id
            }

        },
        {

            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }

        }

    ])

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully."))
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory}
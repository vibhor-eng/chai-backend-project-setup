import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

export {registerUser,loginUser,logoutUser,refreshAccessToken}
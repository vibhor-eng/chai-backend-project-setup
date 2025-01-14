import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    
    const {content} = req.body
    const owner = req.user.id
    
    

    // console.log("video",video)

    if(!content){
        throw new ApiError(400, "content is required.")
    }

    const tweet = await Tweet.create({
        content,
        owner

    })

    const CreatedTweet = await Tweet.findById(tweet._id)

    return res.status(201).json(
        new ApiResponse(200,CreatedTweet,"Tweet has been added.")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {page = 1, limit = 10} = req.query
    
    const tweets = await Tweet.find({ owner: req.user.id })
            .skip((page - 1) * limit) // Skip records for pagination
            .limit(Number(limit)); // Limit the number of records

    return res.status(200)
            .json(new ApiResponse(200,tweets,"fetched successfully."))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // TODO: update a comment
        try{
                const {content,_id} = req.body
                if(!content){
                    throw new ApiError(400,"Content fields are required.")
                }
                if(!_id){
                    throw new ApiError(400,"Id fields are required.")
                }
    
                console.log("iddd",_id)
    
                //id from middleware
                const updatedTweet =     await Tweet.findByIdAndUpdate(
                        _id,
                        {
                            //jo field hme set karna hai
                            $set:{
                                content,
                            }
                        },
                        {new:true}
                    ).select('-_id')
    
                    return res.status(200)
                .json(new ApiResponse(200,updatedTweet,"updated successfully."))
        }catch(error){
            console.log("errr",error)
            throw new ApiError(500, "Something went wrong.")
        }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // TODO: delete a comment
    
        const {id} = req.params
    
        if(!id){
            throw new ApiError(400,"Id is missing")
        }
        
        const deletedTweet = await Tweet.findByIdAndDelete(id);
        
        //this deletedTweet return what record has been deleted
        return res.status(200)
                .json(new ApiResponse(200,deletedTweet,"tweet deleted successfully."))

        /*this will return remain record in db
        const {page = 1, limit = 10} = req.query
    
        const tweets = await Tweet.find({ owner: req.user.id })
            .skip((page - 1) * limit) // Skip records for pagination
            .limit(Number(limit)); // Limit the number of records

            return res.status(200)
                .json(new ApiResponse(200,tweets,"tweet deleted successfully."))*/
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
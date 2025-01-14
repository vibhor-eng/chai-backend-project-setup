import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    
    //TODO: toggle like on comment
    const user_id = req.user.id;
   

    if(!videoId){
        throw new ApiError(400,"Video id is missing")
    }


    // check comment exist or not on belaf of comment id
    const VideoExist = await Video.findById(videoId)
    

    if(!VideoExist){
        throw new ApiError(400,"Video not found")
    }

    //get the likes on behalf of owner and comment id
    const likeExist = await Like.find({
        owner:user_id,
        video:videoId
    })

   

    if(likeExist.length <= 0){
        // User hasn't liked the comment, so we add the like
        const like = await Like.create({
            comment:null,
            likedBy:user_id,
            video:videoId,
            tweet:null

        })

        const LikedComment = await Like.findById(Like._id).select("-_id")

        

        return res.status(201).json(
            new ApiResponse(200,LikedComment,"Liked Comment.")
        )

    }else{

        // User has already liked the post, so we remove the like
        // console.log(likeExist[0]._id);

        const deletedComment = await Like.findByIdAndDelete(likeExist[0]._id);

        return res.status(200)
            .json(new ApiResponse(200,deletedComment,"Unliked successfully."))
    }

})

// comment like/dislike api
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    //TODO: toggle like on comment
    const user_id = req.user.id;
   

    if(!commentId){
        throw new ApiError(400,"Comment id is missing")
    }


    // check comment exist or not on belaf of comment id
    const commentExist = await Comment.findById(commentId)
    

    if(!commentExist){
        throw new ApiError(400,"Comment not found")
    }

    //get the likes on behalf of owner and comment id
    const likeExist = await Like.find({
        owner:user_id,
        comment:commentId
    })

   

    if(likeExist.length <= 0){
        // User hasn't liked the comment, so we add the like
        const like = await Like.create({
            comment:commentId,
            likedBy:user_id,
            video:null,
            tweet:null

        })

        const LikedComment = await Like.findById(Like._id).select("-_id")

        

        return res.status(201).json(
            new ApiResponse(200,LikedComment,"Liked Comment.")
        )

    }else{

        // User has already liked the post, so we remove the like
        // console.log(likeExist[0]._id);

        const deletedComment = await Like.findByIdAndDelete(likeExist[0]._id);

        return res.status(200)
            .json(new ApiResponse(200,deletedComment,"Unliked successfully."))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const user_id = req.user.id;
   

    if(!tweetId){
        throw new ApiError(400,"Tweet id is missing")
    }


    // check comment exist or not on belaf of comment id
    const TweetExist = await Tweet.findById(tweetId)
    

    if(!TweetExist){
        throw new ApiError(400,"Tweet not found")
    }

    //get the likes on behalf of owner and comment id
    const likeExist = await Like.find({
        owner:user_id,
        tweet:tweetId
    })

   

    if(likeExist.length <= 0){
        // User hasn't liked the comment, so we add the like
        const like = await Like.create({
            comment:null,
            likedBy:user_id,
            video:null,
            tweet:tweetId

        })

        const LikedComment = await Like.findById(Like._id).select("-_id")

        

        return res.status(201).json(
            new ApiResponse(200,LikedComment,"Liked Comment.")
        )

    }else{

        // User has already liked the post, so we remove the like
        // console.log(likeExist[0]._id);

        const deletedComment = await Like.findByIdAndDelete(likeExist[0]._id);

        return res.status(200)
            .json(new ApiResponse(200,deletedComment,"Unliked successfully."))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    
})

const getLikedComments = asyncHandler(async(req, res) => {
    //TODO: Get All liked comments
    const user_id = req.user.id

    const LikedComments = await Like.find({
        comment: { $ne:null }
    });

    return res.status(200)
            .json(new ApiResponse(200,LikedComments,"fetched successfully."))

    console.log(LikedComments)
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComments
}
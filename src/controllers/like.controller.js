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
    const user_id = req.body.id;
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Video id is missing")
    }

    const videoExist = await Video.findById(videoId)

    if(!videoExist){
        throw new ApiError(400,"Video not found")
    }

    // Check if the user has already liked the video
    const userIndex = videoExist.video.indexOf(user_id);
    if (userIndex === -1) {
        // User hasn't liked the video, so we add the like
        videoExist.likes += 1;
        videoExist.video.push(user_id);
        await videoExist.save();
        return res.json({ message: 'Video liked', likes: videoExist.likes });
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    //TODO: toggle like on comment
    const user_id = req.body.id;
   

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
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
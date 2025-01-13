import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
        const ObjectId = new mongoose.Types.ObjectId;
        const {content} = req.body
        const owner = req.user.id
        const video = ObjectId(req.body.video)

        console.log("video",video)

        if(!content){
            throw new ApiError(400, "content is required.")
        }

        const comment = await Comment.create({
            content,
            video,
            owner

        })

        return res.status(201).json(
            new ApiResponse(200,CreatedUsers,"Comment has been added.")
        )
    


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
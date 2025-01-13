import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {id} = req.params
    // or you can write with same name jo column ka naam hai
    // const {video} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = await Comment.find({ video: id })
            .skip((page - 1) * limit) // Skip records for pagination
            .limit(Number(limit)); // Limit the number of records

    return res.status(200)
            .json(new ApiResponse(200,comments,"fetched successfully."))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
       
        const {content,video} = req.body
        const owner = req.user.id
       
       

        // console.log("video",video)

        if(!content){
            throw new ApiError(400, "content is required.")
        }

        const comment = await Comment.create({
            content,
            video,
            owner

        })

        const CreatedComment = await Comment.findById(comment._id).select("-_id")

        return res.status(201).json(
            new ApiResponse(200,CreatedComment,"Comment has been added.")
        )
    


})

const updateComment = asyncHandler(async (req, res) => {
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
            const updatedComment =     await Comment.findByIdAndUpdate(
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
            .json(new ApiResponse(200,updatedComment,"updated successfully."))
    }catch(error){
        console.log("errr",error)
        throw new ApiError(500, "Something went wrong.")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {id} = req.params

    if(!id){
        throw new ApiError(400,"Id is missing")
    }
    
    const deletedUser = await Comment.findByIdAndDelete(id);

    return res.status(200)
            .json(new ApiResponse(200,deletedUser,"deleted successfully."))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
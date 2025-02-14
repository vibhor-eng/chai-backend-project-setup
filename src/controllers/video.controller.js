import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.find({ user_id: userId })
                .skip((page - 1) * limit) // Skip records for pagination
                .limit(Number(limit)); // Limit the number of records
    
    return res.status(200)
            .json(new ApiResponse(200,videos,"fetched successfully."))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    // all parameter check once empty
    if([title, description].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const videoPath = req.files?.video[0]?.path;
    console.log("=======",req.body)
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400, "Video id is required.")
    }

    const videos = await Video.findById(videoId);

    return res.status(200)
            .json(new ApiResponse(200,videos,"fetched successfully."))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const user_id = req.user.id;

    // check comment exist or not on belaf of comment id
    const videoExist = await Video.findById(videoId)
    

    if(!videoExist){
        throw new ApiError(400,"Video not found")
    }

    if(videoExist.isPublished){//means video already published

    
                    const videoPublished =     await Video.findByIdAndUpdate(
                        videoId,
                            {
                                //jo field hme set karna hai
                                $set:{
                                    isPublished:false,
                                }
                            },
                            {new:true}
                        ).select('-_id')
        
                        return res.status(200)
                    .json(new ApiResponse(200,updatedComment,"Unpublished successfully."))

    }
    else{ //means video not published

        const videoPublished =     await Video.findByIdAndUpdate(
            videoId,
                {
                    //jo field hme set karna hai
                    $set:{
                        isPublished:true,
                    }
                },
                {new:true}
            ).select('-_id')

            return res.status(200)
        .json(new ApiResponse(200,updatedComment,"published successfully."))

    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist

    const {name, description} = req.body
    const user_id = req.user.id;

    // all parameter check once empty
    if([name, description].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check vide exist in playlist or not
    const VideoExistInPlaylist = await Playlist.find(
        {
            name: name
        }
    )

    if(VideoExistInPlaylist.length > 0){
        throw new ApiError(400,"Playlist already exist")
    }

        const PlaylistCreated = await Playlist.create({
                name:name,
                description:description,
                video:[],
                owner:user_id
    
            })

            return res.status(201).json(
                new ApiResponse(200,PlaylistCreated,"PlayList Created.")
            )

    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    // const {userId} = req.params
    //TODO: get user playlists
    const user_id = req.user.id

    const playlistData = await Playlist.find({
        owner:user_id
    })

    if(playlistData.length > 0){
        return res.status(201).json(
            new ApiResponse(200,playlistData,"PlayList fetched successfully.")
        )
        
    }else{
        throw new ApiError(400,"Playlist not found")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id  

    if(!playlistId){
        throw new ApiError(400,"Playlist id is mandatory")
    }

    const playlistData = await Playlist.findById(playlistId)
    
    if(playlistData){
        return res.status(201).json(
            new ApiResponse(200,playlistData,"PlayList fetched successfully.")
        )
        
    }else{
        throw new ApiError(400,"Playlist not found")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params


    if(!videoId){
        throw new ApiError(400,"Video id is mandatory.")
    }

    if(!playlistId){
        throw new ApiError(400,"playlist id is mandatory.")
    }

    const playlistData = await Playlist.findById(playlistId);
    if(!playlistData){
        throw new ApiError(400,"Playlist not found")
    }

    if(!videoId){
        throw new ApiError(400,"Video id is mandatory.")
    }

    const updatePlaylistData = await Playlist.updateOne(
        { _id: playlistId },
            {
                $push: { videos: videoId }
            },
            {new:true}//updated data return
        ).select('-_id')//jo fiels chorna hai

    return res.status(200)
    .json(new ApiResponse(200,updatePlaylistData,"Added video into playlist successfully."))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist


    if(!videoId){
        throw new ApiError(400,"Video id is mandatory.")
    }

    if(!playlistId){
        throw new ApiError(400,"playlist id is mandatory.")
    }

    const playlistData = await Playlist.findById(playlistId);
    if(!playlistData){
        throw new ApiError(400,"Playlist not found")
    }

    if(!videoId){
        throw new ApiError(400,"Video id is mandatory.")
    }

    const updatePlaylistData = await Playlist.updateOne(
        { _id: playlistId },
            {
                $pull: { videos: videoId }
            },
            {new:true}//updated data return
        ).select('-_id')//jo fiels chorna hai

    return res.status(200)
    .json(new ApiResponse(200,updatePlaylistData,"remove video into playlist successfully."))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Playlist id is mandatory")
    }

    const deletedplaylist = await Playlist.findByIdAndDelete(playlistId);
            
    //this deletedTweet return what record has been deleted
    return res.status(200)
            .json(new ApiResponse(200,deletedplaylist,"playlist deleted successfully."))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    // all parameter check once empty
    if([name, description].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //id from middleware
    const updatedPlaylist =     await Playlist.findByIdAndUpdate(
        playlistId,
            {
                //jo field hme set karna hai
                $set:{
                    name:name,
                    description:description
                }
            },
            {new:true}//updated data return
        ).select('-_id')//jo fiels chorna hai

        return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"updated successfully."))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
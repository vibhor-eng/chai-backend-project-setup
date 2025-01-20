import { Router } from "express";
import {loginUser, logoutUser, refreshAccessToken, registerUser,changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js"

import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { getLikedComments, getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { getAllVideos, getVideoById, publishAVideo, togglePublishStatus } from "../controllers/video.controller.js";

const router = Router()

router.route("/register").post(
    //this is middleware upload
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]), //upload kaafi cheez leta hai but multiple file upload ka skte hai to field lete hai
    registerUser
)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(
    // add middleware
    verifyJWT,
    logoutUser
)

router.route("/refresh-token").post(
    refreshAccessToken
)
//verify jwt is auth middleware
router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
)

router.route("/get-user-details").get(
    verifyJWT,
    getCurrentUser
)

router.route("/update-user-details").patch(
    verifyJWT,
    updateAccountDetails
)

router.route("/update-user-avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)

router.route("/update-user-cover-image").patch(
    verifyJWT,
    upload.single("/coverImage"),
    updateUserCoverImage
)

//params route
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)

// comment
router.route("/get-video-comment/:id").get(verifyJWT,getVideoComments)
router.route("/add-comment").post(verifyJWT,addComment)
router.route("/update-comment").post(verifyJWT,updateComment)
router.route("/delete-comment/:id").delete(verifyJWT,deleteComment)

// twitter
router.route("/add-tweet").post(verifyJWT,createTweet)
router.route("/get-user-tweet").get(verifyJWT,getUserTweets)
router.route("/update-tweet").post(verifyJWT,updateTweet)
router.route("/delete-tweet/:id").delete(verifyJWT,deleteTweet)

// Like
router.route("/video-toggle-like/:videoId").get(verifyJWT,toggleVideoLike)
router.route("/comment-toggle-like/:commentId").get(verifyJWT,toggleCommentLike)
router.route("/tweet-toggle-like/:tweetId").get(verifyJWT,toggleTweetLike)  
router.route("/get-liked-video").get(verifyJWT,getLikedVideos) 
router.route("/get-liked-comment").get(verifyJWT,getLikedComments) 

//playlist
router.route("/create-playlist").post(verifyJWT,createPlaylist)
router.route("/get-user-playlist").get(verifyJWT,getUserPlaylists)
router.route("/get-playlist-by-id/:playlistId").get(verifyJWT,getPlaylistById)
router.route("/delete-playlist-by-id/:playlistId").delete(verifyJWT,deletePlaylist)
router.route("/update-playlist-by-id/:playlistId").patch(verifyJWT,updatePlaylist)
router.route("/add-video-to-playlist-id/:playlistId/:videoId").patch(verifyJWT,addVideoToPlaylist)
router.route("/remove-video-to-playlist-id/:playlistId/:videoId").patch(verifyJWT,removeVideoFromPlaylist)

//video
router.route("/get-all-video").get(verifyJWT,getAllVideos)
router.route("/publish-video").post(verifyJWT,publishAVideo)
router.route("/get-video-by-id/:videoId").get(verifyJWT,getVideoById)
router.route("/toggle-publish-video/:videoId").get(verifyJWT,togglePublishStatus)




export default router
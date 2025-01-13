import { Router } from "express";
import {loginUser, logoutUser, refreshAccessToken, registerUser,changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js"

import { addComment } from "../controllers/comment.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/add-comment").post(verifyJWT,addComment)

export default router
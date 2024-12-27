import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"

import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(
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

export default router
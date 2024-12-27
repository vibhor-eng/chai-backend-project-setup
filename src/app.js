import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

// major use this
// app.use(cors())

// but we can use more option of cors like kis url se request chahiye etc

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//accept json
app.use(express.json({
    limit:"16kb"
}))

// url encoded limit of request
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

// if we want to save pdf or images or any type of file
// public is a folder name where file will be save
app.use(express.static("public"))

app.use(cookieParser())

// configuration upper

//routes import

import userRouter from './routes/user.router.js'

//routes declaration
app.use("/api/v1/users",userRouter)
 
export { app }
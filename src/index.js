// require('dotenv').config()
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

// import express from "express"
console.log("====== PORT",process.env.PORT)

connectDB()














/*
const app = express()
// iffy start from semicolon
// await is compulsary when coneect db
;( async () =>{
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("Error: ",error)
            throw err
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listeing on port ${process.env.PORT}`)
        })

    }catch(error){
        console.error("Error: ",error)
        throw err
    }
})() */
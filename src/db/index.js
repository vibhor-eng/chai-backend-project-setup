import mongoose, { connect } from "mongoose";

import { DB_NAME } from "../constant.js";

// use async because db in other continent
const connectDB = async () => {
    try{
        // we can store it in variable because mongoose return string
        const connectionString = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

        console.log(`\n MongoDb Connected !! DB HOST: ${connectionString.connection.host}`)

    }catch(error){
        console.error("Mongodb connect error ",error);
        // we can exit process because of so many process
        process.exit(1)
    }
}

export default connectDB
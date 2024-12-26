import { v2 as cloudinary } from 'cloudinary';

import fs from "fs" //fs is a filesytem no need to install externally

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY, // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localpath) => {

    try{

        if(!localpath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localpath, {
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary",response.url)
        return response;
    }catch(error){
        fs.unlinkSync(localpath)//remove the locally saved file as the uplod operation got failed.
        return null;
    }

}

// arrow function
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve().catch((err) => next(err))
    }
}
    
export {asyncHandler}

// const asyncHandler = (fn) => aysnc (req,res,next) => {

//     try{
//         await fn(req,res,next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             success:false,
//             messgae:err.msg
//         })
//     }
    
// }
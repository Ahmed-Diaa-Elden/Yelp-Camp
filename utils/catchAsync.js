module.exports = function(fn){
    return function(req,res,next){
        fn(req,res,next).catch(e=> next(e))
    }
}

// both are same

// module.exports = fn=>{
//     return (req,res,next)=>{
//         fn(req,res,next).catch(e=> next(e))
//     }
// }
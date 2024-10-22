require('dotenv').config()
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

const authentication = (req,res,next) =>{
    const apikey = req.header('Api_secret_key');
  
    if(!apikey || apikey != SECRET_KEY){
        return res.status(401).json({result:{msg : "Unathorized User" , isComplete:false}})
     }
    else{ 
      next();
    }
}


module.exports = {authentication};
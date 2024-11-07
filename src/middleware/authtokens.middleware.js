require('dotenv').config()
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const jwt = require("jsonwebtoken");
const { verifyRefreshAndassignAccess } = require('../main/Authentication/Authentication.scripts');

const authAccessToken = async (req,res,next) =>{ 
    let refreshToken = req.header("AuthorizationRefresh")?.replace("Bearer ", "");
    const forwardedIps = req.headers['x-forwarded-for'];
    const ipAddress = forwardedIps ? forwardedIps.split(',')[0] : req.ip;
    const ua = req.useragent;
    try {
        let AccessToken = req.header("Authorization")?.replace("Bearer ", "");
        let refreshToken = req.header("AuthorizationRefresh")?.replace("Bearer ", "");
        if(AccessToken){
            let user = jwt.verify(AccessToken, SECRET_KEY);
            req.userId = user.master_user_id;
            let issueDate = new Date(user.iat * 1000).toUTCString(); 
            console.log(issueDate);
            let expiryDate = new Date(user.exp * 1000).toUTCString();
            console.log(expiryDate)
            console.log(user);

            const currentTime = Math.floor(Date.now() / 1000);
            const timeLeft = user.exp - currentTime;
            if (timeLeft > 50) {
                console.log(`Time left until token expiry: ${timeLeft} seconds`);
                next();
            } else {
                console.log(`Time left until token expiry: ${timeLeft} seconds`);
                let newToken = await verifyRefreshAndassignAccess(refreshToken,ipAddress,ua,res);
                res.status(200).json({msg : "Token is about to expire and new token set.",newToken:newToken , isComplete:true});
            }
        }
        else{
            res.status(401).json({msg : "Unathorized User" , isComplete:false});
        }
    } 
    catch (error) {
        if(error.message == "jwt expired" || (typeof error.expiredAt != 'undefined' && error.expiredAt != null)){
            let newToken = await verifyRefreshAndassignAccess(refreshToken,ipAddress,ua,res);
            res.status(200).json({msg : "Unathorized User and new token set.",newToken:newToken , isComplete:true});
        }else{
            console.log(error)
            res.status(500).json({msg : "Something went wrong" , isComplete:false});
        }
    }
}

module.exports = {authAccessToken};
require('dotenv').config()
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const jwt = require("jsonwebtoken");

const authAccessToken = (req,res,next) =>{ 
    let refreshToken = req.header("AuthorizationRefresh")?.replace("Bearer ", "");   
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
                let newToken = authRefreshToken(refreshToken);
                res.status(403).json({result:{msg : "Token is about to expire.",newToken:newToken , isComplete:false}});
            }
        }
        else{
            res.status(401).json({result:{msg : "Unathorized User" , isComplete:false}});
        }
    } 
    catch (error) {
        if(error.message == "jwt expired" ||(typeof error.expiredAt != 'undefined' && error.expiredAt != null)){
            let newToken = authRefreshToken(refreshToken);
            res.status(401).json({result:{msg : "Unathorized User",newToken:newToken , isComplete:false}});
        }else{
            console.log(error)
            res.status(500).json({result:{msg : "Something went wrong" , isComplete:false}});
        }
    }
}

const authRefreshToken = (Token) =>{    
    try {
        let RefreshToken = Token; /* req.cookies?.refreshToken */
        if(RefreshToken){
            let user = jwt.verify(RefreshToken, SECRET_KEY);
            //req.userId = user.master_user_id;
            console.log("refreshUser",user);
            let AccessToken =  jwt.sign(
                {
                    id: "2",
                    email: 'ajay@gmail.com',
                    username: "ajay@512001",
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                }
            )
            return AccessToken;
            // next();
        }
        else{
            res.status(401).json({result:{msg : "Unathorized User" , isComplete:false}});
        }
    } 
    catch (error) {
        console.log(error)
        res.status(401).json({result:{msg : "Unathorized User Refresh" , isComplete:false}});
    }
}

module.exports = {authAccessToken,authRefreshToken};
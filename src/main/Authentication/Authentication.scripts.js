const pool = require("../../configs/databaseConnection");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const useragent = require('express-useragent');
require('dotenv').config();
const sendMail = require('../../utils/sendEmails/sendMailFunction')

const authQueries = require('./Authentication.queries')


const saltRounds = 10;



const authSignIn = async (req,res)  => {
    const { email, password } = req.body;

    try {
        let user = await pool.query(authQueries.getUser, [email]);
        if(user.rows.length){
            const matchPaswd = await bcrypt.compare(password, user.rows[0].password);
            if(!matchPaswd){
                return res.status(201).json({ msg: "Inavalid credential.", isComplete:false, code:201} );
            }else{
                if(user.rows[0].is_active){
                    const token = await createAuthToken(email,user.rows[0].user_id);
                    const refreshToken = await createRefreshToken(user.rows[0].user_id,email,req);
                    res.status(200).json({data : user.rows[0], token : token, refreshToken: refreshToken, msg : "User signedin Successfully",isComplete:true});
                }else{
                    const otp = await generateOtp();
                    let isotpUpdate = await pool.query(authQueries.updateOtp , [ user.rows[0].user_id , otp]);
                    res.status(202).json({msg : "Please verify with OTP to activate user.",isComplete:false, code :202});
                    sendMail.module.sendNotificationRequest({otp_code : otp , to : email});
                }
            }
        }else{
            res.status(211).json({ msg: "User not exists with this email.",isComplete:false,code:211});
        }
    } catch (error) {
        return res.status(500).json({msg:"server encountered error.", error: error.message,isComplete:false});
    }
}


const authSignUp = async (req,res) => {
    const { email, password, full_name, number } = req.body;

    try {
        let user = await pool.query(authQueries.checkEmailExits, [email]);
        if(user.rows.length){
            return res.status(212).json({ msg: "Email Already Exists. Try with different Email.",isComplete:false});
        }else{
            const hashPassword = await bcrypt.hash(password, saltRounds);
            const otp = await generateOtp();
            let isuserCreated = await pool.query(authQueries.addUser , [ email, hashPassword, full_name, number, "false" , otp,0]);
            if(isuserCreated){
                let userwhichiscreated =  await pool.query(authQueries.getUserId, [email]);
                res.status(200).json({user_id: userwhichiscreated.rows[0].user_id,msg : "User created Successfully.",isComplete:true});
                sendMail.module.sendNotificationRequest({otp_code : otp , to : email});
            }else{
                return res.status(500).json({msg:"Something went wrong, Please try again later.",isComplete:false});
            }
        }
    } catch (error) {
        return res.status(500).json({result:{msg:"server encountered error.", error: error.message,isComplete:false}});
    }
}


const verifyToken = async (req,res) => {
    const { token } = req.body;

    try {
        let user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({msg : "Token Is Ok" ,id:user.user_id, code :200, isComplete:false});
    } catch (error) {
        res.status(210).json({msg : "Token Expired" , code :210, isComplete:false});
    }
}

const verifyRefreshTokenAndAssign = async (req,res) => {
    const { refreshToken } = req.body;
    const ua = await req.useragent;
    const forwardedIps = req.headers['x-forwarded-for'];
    const ipAddress = forwardedIps ? forwardedIps.split(',')[0] : req.ip;
    try {
       let user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
       if(user.ipAddress == ipAddress && user.browser == ua.browser && user.os == ua.os){
        let AccessToken =  await createAuthToken(user.email,user.user_id);
        res.status(200).json({msg : "New Access Token" , token:AccessToken , code :200, isComplete:false});
    } else{
        res.status(401).json({msg : "Unathorized User" , code :401, isComplete:false});
    }
    } catch (error) {
       res.status(411).json({msg : "Refresh Token Expired" , code :411, isComplete:false});
    }
}


const verifyOtp =  async (req,res) => {
    const { user_id,otp,email_id,reason } = req.body;
    let userOtp;
    try {
        if(user_id != undefined && user_id != null){
            userOtp = await pool.query( authQueries.getotp ,[user_id]);
        }else{
            userOtp = await pool.query( authQueries.getotpbyEmail ,[email_id]);
        }
        if(otp == userOtp.rows[0].temp_otp){
            if(user_id != undefined && user_id != null){
                await pool.query( authQueries.getisactivetrue ,[user_id]);
            }else{
                await pool.query( authQueries.getisactivetrue ,[userOtp.rows[0].user_id]);
            }

            if(reason == "signin"){
                const token = await createAuthToken(email_id,userOtp.rows[0].user_id || user_id);
                const refreshToken = await createRefreshToken(userOtp.rows[0].user_id || user_id,email_id,req);
                return res.status(200).json({msg:"OTP Verfied",token : token, refreshToken : refreshToken ,data: {user_id:userOtp.rows[0].user_id || user_id }, isComplete:true});
            }else{
                return res.status(200).json({msg:"OTP Verfied",isComplete:true});
            }
            
        }else{
            return res.status(202).json({msg:"Wrong OTP",isComplete:false});
        }
    } catch (error) {
        return res.status(500).json({msg:"server encountered error.", error: error.message,isComplete:false});
    }
}

const verifyRefreshAndassignAccess = async (refreshToken,ipAddress,ua,res) => {
    
    let RefreshToken = refreshToken; /* req.cookies?.refreshToken */
    if(RefreshToken){
        let user = jwt.verify(RefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(user.ipAddress == ipAddress && user.browser == ua.browser && user.os == ua.os){
            let AccessToken =  await createAuthToken(user.email,user.user_id)
            return AccessToken;
        } else{
            res.status(401).json({result:{msg : "Unathorized User" , isComplete:false}});
        }
    }
    else{
        res.status(401).json({result:{msg : "Unathorized User" , isComplete:false}});
    }
}

const createAuthToken = async (email,user_id) => {
     let AccessToken = await jwt.sign(
        {
            user_id: user_id,
            email: email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    return AccessToken;
}

const createRefreshToken = async (user_id,email,req) => {
    const forwardedIps = req.headers['x-forwarded-for'];
    const ipAddress = forwardedIps ? forwardedIps.split(',')[0] : req.ip;
    const ua = req.useragent;
    let refreshToken = jwt.sign(
        {
            user_id: user_id,
            email : email,
            ipAddress:ipAddress,
            browser : ua.browser,
            platform : ua.platform,
            os : ua.os,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

    return refreshToken;
}


const generateOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}




module.exports = {
    authSignIn,
    authSignUp,
    verifyRefreshAndassignAccess,
    verifyOtp,
    verifyRefreshTokenAndAssign,
    verifyToken
}
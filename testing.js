const testRouter = require('express');
const pool = require("./src/configs/databaseConnection");
const testrouter = testRouter();
const useragent = require('express-useragent');
const jwt = require("jsonwebtoken");


require('dotenv').config()
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET;


testrouter.get("/test", async (req,res) => {
    // let info = await pool.query("select * from excelcheck");
    const forwardedIps = req.headers['x-forwarded-for'];
    const ipAddress = forwardedIps ? forwardedIps.split(',')[0] : req.ip;
    const ua = await req.useragent;
    /* res.status(200).json({data:ipAddress,info:{
        ua
    }});
 */
    res.json({
        browser: ua.browser,        // e.g., 'Chrome'
        version: ua.version,        // e.g., '88.0.4324.150'
        os: ua.os,                  // e.g., 'Windows 10'
        platform: ua.platform,      // e.g., 'Desktop'
        isMobile: ua.isMobile,      // true or false
        isTablet: ua.isTablet,      // true or false
        isDesktop: ua.isDesktop,    // true or false
    });

    // let info = await pool.query("insert into excelcheck (name, age) VALUES ($1, $2)",['sonal',38]);
    // res.status(200).json(info.rowCount);
})

testrouter.post("/getToken", async (req,res) => {
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

    const forwardedIps = req.headers['x-forwarded-for'];
    const ipAddress = forwardedIps ? forwardedIps.split(',')[0] : req.ip;
    const ua = req.useragent;
    let results = {
        browser: ua.browser,        
        version: ua.version,        
        os: ua.os,                  
        platform: ua.platform,      
        isMobile: ua.isMobile,      
        isTablet: ua.isTablet,      
        isDesktop: ua.isDesktop,    
    }

    let refreshToken = jwt.sign(
        {
            id: "3",
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
    res.status(200).json({result:{data : results, token : AccessToken, refreshToken:refreshToken, IP: ipAddress ,isComplete:true}});
})



module.exports = testrouter;
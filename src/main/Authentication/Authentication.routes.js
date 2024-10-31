const AuthRouter = require('express')
const AuthController = require('./Authentication.controllers')
const authrouter = AuthRouter();

authrouter.post('/signup', AuthController.signUp);

authrouter.post('/signin', AuthController.signIn);

authrouter.post('/verifyotp', AuthController.verifyOtp);

authrouter.post('/verifytoken', AuthController.verifyToken);

authrouter.post('/verifyrefrsh', AuthController.verifyRefreshToken);

module.exports = authrouter;
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require("helmet");
const { exec } = require('child_process');
const useragent = require('express-useragent');

/*------------------------All file imports -------------------------*/
const middleAuthenication = require('./src/middleware/authentication.middlewar');
const middleAuthorization = require('./src/middleware/authtokens.middleware');
const testRoutes = require("./testing");
const AuthRotes = require("./src/main/Authentication/Authentication.routes");
const employeeRotes = require("./src/main/employee/employee.routes");

/*------------------------All variable defined here -------------------------*/
require('dotenv').config()
const port = process.env.PORT;
isDisconnect = false;


/*------------------------cors policies and security -------------------------*/
const corsOptions = {
    origin:'*', 
    credentials:true,
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(useragent.express());
app.use(express.urlencoded({extended: false}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" )
    next();
});



/*------------------------ We will start the server here -------------------------*/
app.listen(port, ()=> console.log(`app is listining on port ${port}`))

app.get("/", (req,res) => {
  res.send(`server started on localhost:${port}`)
})

/*------------------------All rotes are routed here -------------------------*/
app.use('/',  testRoutes);
app.use('/api/v1/auth/',  middleAuthenication.authentication, AuthRotes);
//app.use('/api/v1/employee/',  middleAuthorization.authAccessToken, employeeRotes);
app.use('/api/v1/employee/', employeeRotes);


/*----------------------- Restarting server on any crash automatically -------------------------*/
process.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
    from = "crashed";
    notifyName = "crashed";
    console.log(isDisconnect);
    if(!isDisconnect){
      restartTerminal(from,notifyName);
    }
});

process.on('uncaughtException' ,(error) =>{
    console.log('Process caught uncaughtException', error);
    from = "crashed";
    notifyName = "crashed";
    console.log(isDisconnect);
    if(!isDisconnect){
      restartTerminal(from,notifyName);
    }
});

process.on('unhandledRejection' ,(reject) =>{
    console.log('Process caught unhandledRejection',reject);
    from = "crashed";
    notifyName = "crashed";
    console.log(isDisconnect);
    if(!isDisconnect){
      restartTerminal(from,notifyName);
    }
});

const restartTerminal = (from,notifyName) => {
    const filePath = 'crasherror.js';
    let date = new Date();
    const fileContent = `//service was restarted by ${from} with Notify Name ${notifyName} at ${date}.`;
  
    const command =  `@echo ${fileContent} >> ${filePath} 2> nul`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error saving file:', err);
      } else {
        console.log('File saved successfully:', filePath);
      }
    }); 
};
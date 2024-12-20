const nodemailer = require("nodemailer");
const mailConfig = require("../../configs/mailConnection");
const fs = require('fs');

async function sendNotificationRequest(req,type) {
    const isOnlineModule = await import('is-online');
    const isOnline = isOnlineModule.default || isOnlineModule;
    const online = await isOnline();
    if (online) {
        createDynamicData(req,type);
    } else {
        console.log('Internet is not working');
        /* pool.query("INSERT INTO SendNotificationEmail(email_id, email_from, email_to, response,emailtype,emailtemplate,ispending) VALUES ($1,$2,$3,$4,$5,$6,$7)" ,[null,"ajaygajjarkar512001@gmail.com",req.email,null,emailType,null,0], (error,results) =>{
        }) */
    }
};




async function createDynamicData(req,emailType) {

    const imagePath = 'C:/Users/HP/Desktop/Methi/methiServer/src/utils/sendEmails/templates/images/logo_load_p.png';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/png'; // or 'image/jpeg', depending on the image type
    const base64ImageSrc = `data:${mimeType};base64,${base64Image}`;

    let emailTemplate;
    let dynamicData;

    if(emailType == 'verificationEmail'){
      emailTemplate = await fs.readFileSync('src/utils/sendEmails/templates/otp_verification.html', 'utf-8');
      dynamicData = {
        otp_code : req.otp_code,
        subject :"Verification Account Required."
      };
      FormatedEmailTemplate = await emailTemplate.replace(/{{otp_code}}/g, dynamicData.otp_code).replace(/{{image}}/g, base64ImageSrc);
    } else if(emailType == 'verificationSuccess'){
      emailTemplate = await fs.readFileSync('src/utils/sendEmails/templates/account_verrified.html', 'utf-8');
      dynamicData = {
        user_name : req.user_name,
        acc_link: req.acc_link,
        subject :"Account Activation Successful—Welcome Onboard!."
      };
      FormatedEmailTemplate = await emailTemplate.replace(/{{user_name}}/g, dynamicData.user_name).replace(/{{acc_link}}/g, dynamicData.acc_link);
    } else if(emailType == 'accountUppdated'){
      emailTemplate = await fs.readFileSync('src/utils/sendEmails/templates/account_updated.html', 'utf-8');
      dynamicData = {
        user_name : req.user_name,
        acc_link: req.acc_link,
        subject :"Congratulations! Your Account Has Been Upgraded to Admin."
      };
      FormatedEmailTemplate = await emailTemplate.replace(/{{user_name}}/g, dynamicData.user_name).replace(/{{acc_link}}/g, dynamicData.acc_link);
    }
    
    await sendEmail(req.to,emailType,dynamicData.subject,FormatedEmailTemplate)
}





async function sendEmail(email,emailType,subject,template) {
    /* whats we want here is emailtype , to, subject, formatedemailtemplate */
  /* Start smtp Server - start */
  let testAccount = await nodemailer.createTestAccount();
  let transporter = await nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gnail.com",
    port: 587,
    secure: false,
    auth: {
        user: mailConfig.UserName,
        pass: mailConfig.PassWord
    },
  });

  /* Start smtp Server - end */


  /* send email according to attach file or not - start */
  let info;
try {
  if(emailType == "invoice"){
    const pdfBuffer = fs.readFileSync('src/pdf/docs/invoices/first_invoice.pdf');
    info = await transporter.sendMail({
      from: {
        name: mailConfig.SenderName,
        address : mailConfig.UserName
      },
      to: [req.email],
      subject: dynamicData.subject,
      html: FormatedEmailTemplate,
      attachments : [
        {
          filename : "yourInvoice.pdf",
          content : pdfBuffer
        }
      ]
    });
  }else{
    info = await transporter.sendMail({
      from: {
        name: mailConfig.SenderName,
        address : mailConfig.UserName
      },
      to: [email],
      subject: subject,
      html: template,
    });
  }
  
} catch (error) {
  console.log("error",error.message)
}
  /* send email according to attach file or not - end */
}


exports.module = {
    sendNotificationRequest
}
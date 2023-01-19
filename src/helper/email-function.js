const nodemailer = require("nodemailer");
const OtherFunction = require("./other-function");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
require('log-timestamp');
require('dotenv').config();

const key = process.env.SECRET_KEY;
const verifyHost = process.env.VERIFY_HOST;

function GenerateContent(emailTo, password, serverName, from){
    let content = JSON.stringify({ 
        email: emailTo, 
        passwd: password,
        serverName: serverName
    });
    let encryptedContent = OtherFunction.encrypt(content, key);
    let link = verifyHost.trim()+'/api/v1/verify/confirm?id='+Buffer.from(encryptedContent).toString('base64');

    console.log('link:', link);

    const emailOptions = {
        subject: "Seliso Email Verification",
        html : "Greetings.<br>Please click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a><br><br>Best Regards,<br>Seliso Chat Team",
        to: emailTo,
        from: from
    };

    return emailOptions;
}

exports.SendEmailSeliso = async (emailTo, password, serverName) => {

    let transporter = nodemailer.createTransport({
        host: "idsmtp9.idcloudhosting.com",
        port: 587,
        auth: {
            user: process.env.EMAIL_SELISO,
            pass: process.env.EMAIL_SELISO_PASSWD
        }
    });

    let emailOptions = GenerateContent(emailTo, password, serverName, process.env.EMAIL_SELISO);

    console.log('enailOptions:',emailOptions);

    transporter.sendMail(emailOptions, function(error, response){        
        console.log('Response: ', response);

        if (error){
            console.log('Error', error);
            return ({ result: 'NOK' });
        }
        console.log('Send Email OK');
        return ({ result: 'OK' });

    });
}

exports.SendEmailGmail = async (emailTo, password, serverName) => {    

    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );
   
    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
        if (err) {
            reject("Failed to create access token :(");
        }
        resolve(token);
        });
    });

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL_GMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    let emailOptions = GenerateContent(emailTo, password, serverName, process.env.EMAIL_GMAIL);

    transporter.sendMail(emailOptions, function(error, response){        
        console.log('Response: ', response.messageId);

        if (error){
            console.log('Error', error);
            return ({ result: 'NOK' });
        }
        console.log('Send Email OK');
        return ({ result: 'OK' });

    });

}
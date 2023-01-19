const mongodbUserFunction = require('../../helper/mongodb-user-function');
const fluuxFunction = require('../../helper/fluux-function');
const OtherFunction = require('../../helper/other-function');
require('log-timestamp');
require('dotenv').config();

const apiString = "Confirmation Verify Rest API";
const version = "v1";

const key = process.env.SECRET_KEY;

exports.testAPI = async (req, res, next) => {    
    res.json({ Msg: apiString, Version: version });
    res.status(200).send();
}

exports.verifyLink = async (req, res, next) => {
    console.log('masuk sini: ', req.query.id);

    if (typeof req.query.id === 'undefined'){
        res.json({ error: 'Link is incorrect' });
        res.status(400).send();
        return;
    }
    
    let content = req.query.id;
    let decodeBase64 = atob(content);
    console.log('decodeBase64: ',decodeBase64);

    let decryptedContent = OtherFunction.decrypt(decodeBase64, key);
    console.log('decryptedContent: ',decryptedContent);
    
    let info = JSON.parse(decryptedContent);
    console.log('info: ',info);

    //-- Solving Bugs: 20220607-B-2 with Solution: 20220607-BS-2 --//
    let getUserInfo = await mongodbUserFunction.GetUser(info.email);
    if (!getUserInfo){
        res.json({ result: 'User Not Found' });
        res.status(200).send();
        return;
    }

    if (getUserInfo.accountStatus === 'active'){ 
        res.json({ result: 'User Already actived' }); 
        res.status(200).send();
        return;
    }
    //-- 20220607-BS-2 (End) --//
    
    //-- Solving Bugs: 20220607-B-1 with Solution: 20220607-BS-1 --//
    let getUpdateAccountStatusResult = await mongodbUserFunction.UpdateAccountStatus(info.email, 'active');
    if (getUpdateAccountStatusResult === 'USERNOTFOUND'){
        res.json({ result: 'Verification failed, user not found.' });
        res.status(200).send();
        return;
    }
    //-- 20220607-BS-1 (End) --//

    console.log('Update password.. ');
    let updateFluuxPassword = await fluuxFunction.ChangePassword(info.email, info.passwd, info.serverName);
    if (updateFluuxPassword.result === 'NOK'){
        res.json({ result: 'Verification failed, user not found.' });
        res.status(200).send();
        return;
    }

    console.log('Update Password successfull');
    res.json({ result: 'User Activated' });
    res.status(200).send();    
}
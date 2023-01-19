const mongodbUserFunction = require('../../helper/mongodb-user-function');
const mongodbHostFunction = require('../../helper/mongodb-host-function');
const otherFunction = require('../../helper/other-function');
const fluuxFunction = require('../../helper/fluux-function');
const emailFunction = require('../../helper/email-function');

require('log-timestamp');

const apiString = "User Management Rest API";
const version = "v1";

exports.testAuth = async (req, res, next) => {    
    res.json({ result: 'Token OK' });
    res.status(200).send();
}

exports.testAPI = async (req, res, next) => {    
    res.json({ Msg: apiString, Version: version });
    res.status(200).send();
}

exports.register = async (req, res, next) => {
    if (!req.body){
        res.json({ result: 'No Parameters' });
        res.status(400).send();
        return;
    }

    let getServer = await mongodbHostFunction.GetAllHostsCapacity();
    let selServer;
    for ( const element of getServer ){
        console.log('data: ', element.serverName, element.capacityLeft);
        if (element.capacityLeft != 0){
            selServer = element.serverName;
            break;
        }
    };
      
    console.log('Use server: ', selServer);   

    let regData = req.body;    
    let checkUserResult = await fluuxFunction.CheckUser(regData.email, selServer);    
    
    if (checkUserResult.result === 'NOK'){
        res.json({ result: 'XMPP Server Not Reachable' });
        res.status(200).send();
        return;
    }

    let fluuxExists = checkUserResult.result === 'USEREXISTS' ? true : false;
    let checkUserdB = await mongodbUserFunction.CheckUserExists(regData.email);
    let databaseExists =  checkUserdB.result === 'USEREXISTS' ? true : false;

    console.log('fluuxExists:', fluuxExists);
    console.log('checkUserdB:', checkUserdB);
    console.log('databaseExists:', databaseExists);

    if (fluuxExists && databaseExists){ //send user is exists
        res.json({ result: 'User Exists' });
        res.status(200).send();
        return;
    }

    if (fluuxExists){ //delete user on fluux server if exists
        if (fluuxFunction.DeleteUser(regData.email, selServer) === 'NOK'){
            res.json({ result: 'Remove XMPP User Failed' });
            res.status(200).send();
            return;
        }
    }

    if (databaseExists){ //delete user on database if exists
        await mongodbUserFunction.DeleteUser(regData.email);
    }

    let generatedPassword = otherFunction.generateString();

    //-- Solving Bugs: 20220607-B-3 with Solution: 20220607-BS-3 --//
    await mongodbUserFunction.CreateUser(regData.password, regData.email, selServer); //add user to database

    let createUserResult = await fluuxFunction.CreateUser(regData.email, generatedPassword, selServer); //try to create user on fluux server
    if (createUserResult.result === 'NOK'){
        res.json({ result: 'Create XMPP User dB Failed' });
        res.status(200).send();
        await mongodbUserFunction.DeleteUser(regData.email); //remove user if cannot register to fluux server
        return;
    }

    let sendConfirmResult = emailFunction.SendEmailSeliso(regData.email, regData.password, selServer);
    if (sendConfirmResult === 'NOK'){
        res.json({ result: 'Send Email Failed.' });
        res.status(200).send();
        await mongodbUserFunction.DeleteUser(regData.email); //remove user in database 
        await fluuxFunction.DeleteUser(email, selServer); //remove user in fluux server
        return;
    }

    await mongodbHostFunction.DecreaseHostCapacity(selServer);

    let jid = regData.email.replace("@", "_at_")+'@'+selServer;

    res.json({ result: 'OK', serverName: selServer, jabberId: jid});
    res.status(200).send();    
}

exports.checkUser = async (req, res, next) => {
    
    if (typeof req.query.email === 'undefined'){
        res.json({ error: 'Email parameter not found' });
        res.status(400).send();
        return;
    }

    let email = req.query.email;
    let getResult = await mongodbUserFunction.GetUser(email);

    if (!getResult){
        res.json({ result: 'User Not Found' });
        res.status(200).send();
        return;
    }

    res.json({ result: 'OK', serverName: getResult.serverName, jabberId: getResult.jabberID });
    res.status(200).send();    
}

exports.unregister = async (req, res, next) => {
    if (typeof req.query.email === 'undefined'){
        res.json({ error: 'Email parameter not found' });
        res.status(400).send();
        return;
    }

    let email = req.query.email;
    let getUserResult = await mongodbUserFunction.GetUser(email);
    if (!getUserResult){
        res.json({ result: 'User is not registered.' });
        res.status(200).send();
        return;
    }
    let serverName = getUserResult.serverName;
    //let serverName = 'seliso001.m.in-app.io';
    let getDeleteResult = await fluuxFunction.DeleteUser(email, serverName);
    if (getDeleteResult.result === 'NOK'){
        res.json({ result: 'User Delete Failed' });
        res.status(200).send();
        return;
    }
    await mongodbUserFunction.DeleteUser(email);
    await mongodbHostFunction.IncreaseHostCapacity(serverName);
    res.json({ result: 'OK' });
    res.status(200).send();
}

exports.listAllUsers = async (req, res, next) => {
    let getResult = await mongodbUserFunction.GetAllUsers();

    if (!getResult){
        res.json({ result: 'User Empty' });
        res.status(200).send();
        return;
    }

    res.json({ result: 'OK', data: getResult });
    res.status(200).send();
}

exports.updatePassword = async (req, res, next) => {
    if (!req.body){
        res.json({ error: 'No Parameters' });
        res.status(400).send();
        return;
    }

    let updateData = req.body;
    let oldPassword = updateData.oldPassword;
    let newPassword = updateData.newPassword;
    let email = updateData.email;
    let getUserResult = await mongodbUserFunction.GetUser(email);
    if (!getUserResult){
        res.json({ result: 'User is not registered.' });
        res.status(200).send();
        return;
    }

    //-- Solving Bugs: 20220607-B-4 with Solution: 20220607-BS-4 --//
    let decryptPassword = otherFunction.decrypt(getUserResult.password, oldPassword);
    if (decryptPassword != email){ //check if old password is not equal with current email
        res.json({ result: 'Incorrect Old Password.' });
        res.status(200).send();
        return;
    }

    let userStatus = getUserResult.accountStatus;
    if (userStatus != 'active'){
        res.json({ result: 'User not activated.' });
        res.status(200).send();
        return;
    }
    //-- 20220607-BS-4 (End) --//

    let serverName = getUserResult.serverName;    
    let getChangePasswdResult = await fluuxFunction.ChangePassword(email, newPassword, serverName);
    if (getChangePasswdResult.result === 'NOK'){
        res.json({ result: 'Change Password Failed' });
        res.status(200).send();
        return;
    }
    
    await mongodbUserFunction.UpdatePassword( email, newPassword );
    res.json({ result: 'OK' });
    res.status(200).send();
}

exports.CheckUserOnFluux = async (req, res, next) => {
    if (!req.body){
        res.json({ error: 'No Parameters' });
        res.status(400).send();
        return;
    }
    
    let checkData = req.body;
    let email = checkData.email;
    let serverName = checkData.serverName;

    let getResult = await fluuxFunction.CheckUser(email, serverName);

    if (getResult.result === 'NOK'){
        res.json({ result: 'Server Error.' });
        res.status(200).send();
        return;
    }

    if (getResult.result === 'USEREXISTS'){
        res.json({ result: 'User Exists.' });
        res.status(200).send();
        return;
    }

    res.json({ result: 'User Not Found.' });
    res.status(200).send();

}

exports.GetUserInfoDb = async (req, res, next) => {
    if (typeof req.query.email === 'undefined'){
        res.json({ error: 'Email parameter not found' });
        res.status(400).send();
        return;
    }

    let email = req.query.email;
    let getResult = await mongodbUserFunction.GetUser(email);

    if (!getResult){
        res.json({ result: 'User Not Found' });
        res.status(200).send();
        return;
    }

    res.json({ result: 'OK', userInfo: getResult });
    res.status(200).send();
}

exports.DeleteUserFluux = async (req, res, next) => {
    if (!req.body){
        res.json({ error: 'No Parameters' });
        res.status(400).send();
        return;
    }
    
    let checkData = req.body;
    let email = checkData.email;
    let serverName = checkData.serverName;

    let checkUserResult = await fluuxFunction.CheckUser(email, serverName);    
    
    if (checkUserResult.result === 'NOK'){
        res.json({ result: 'XMPP Server Not Reachable' });
        res.status(200).send();
        return;
    }

    let fluuxExists = checkUserResult.result === 'USEREXISTS' ? true : false;
    if (fluuxExists == false){
        res.json({ result: 'User is not found in server '+serverName});
        res.status(200).send();
        return;
    }

    let getResult = await fluuxFunction.DeleteUser(email, serverName);
    if (getResult.result === 'NOK'){
        res.json({ result: 'Delete Error.' });
        res.status(200).send();
        return;
    }

    res.json({ result: 'OK' });
    res.status(200).send();
}
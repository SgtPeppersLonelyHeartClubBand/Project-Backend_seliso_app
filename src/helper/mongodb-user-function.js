const UserModel = require("../models/user")
const OtherFunction = require('./other-function');
require('log-timestamp');

let dateTime = require("node-datetime");
let dt = dateTime.create();
let formatted = dt.format("Y-m-d H:M:S");

exports.CreateUser = async (password, emailAddress, serverName) => {

    let encryptedPassword = OtherFunction.encrypt(emailAddress, password);
    let userName = emailAddress.replace("@", "_at_");
    let jid = userName + "@" +serverName;
    /*let emailExists = await UserModel.exists({emailAddress: emailAddress});
    if (emailExists) return ({result: "USEREXISTS"});*/

    const regData = new UserModel({
        accountStatus: "inactive",
        createdAt: formatted,
        createdBy: "sysadmin",
        emailAddress: emailAddress,
        jabberID: jid,
        password: encryptedPassword,
        serverName: serverName,
        subscriptionStatus: "unsubscribed",
        updatedAt: formatted,
        userName: userName
    });

    await regData.save();    
    return ({result: 'OK', serverName: serverName, jabberId: jid });
}

exports.CheckUserExists = async (emailAddress) => {
    let emailExists = await UserModel.exists({emailAddress: emailAddress});

    console.log('Check Email:', emailAddress);
    console.log('emailExists:', emailExists);

    if (emailExists != null) return ({result: "USEREXISTS"});
    return ({result: "OK"});
}

exports.GetUser = async (emailAddress) => {
    let findResult = await UserModel.findOne({ emailAddress: emailAddress });
    return findResult;
}

exports.GetAllUsers = async () => {
    let findResult = await UserModel.find({ });
    return findResult;
}

exports.DeleteUser = async (emailAddress) => {
    let deleteResult = await UserModel.findOneAndDelete({ emailAddress: emailAddress });
    if (!deleteResult) {        
        console.log('User not found');
        return ({ result: 'USERNOTFOUND' });
    }

    console.log('User deleted');
    return ({ result: 'OK' });
}

exports.UpdatePassword = async (emailAddress, password) => {
    let encryptedPasswd = OtherFunction.encrypt(emailAddress, password);
    let updateResult = await UserModel.findOneAndUpdate({ emailAddress: emailAddress }, 
        {password: encryptedPasswd, updatedAt: formatted});
    if (!updateResult){
        return ({ result: 'USERNOTFOUND' });
    }

    return ({ result: 'OK' });
}

exports.UpdateSubscription = async (emailAddress) => {
    let updateResult = await UserModel.findOneAndUpdate({ emailAddress: emailAddress }, 
        {subscriptionStatus: 'subscribed'});
    if (!updateResult){
        return ({ result: 'USERNOTFOUND' });
    }

    return ({ result: 'OK' });
}

//-- Solving Bugs: 20220607-B-1 with Solution: 20220607-BS-1 --//
exports.UpdateAccountStatus = async (emailAddress, status) => {
    let updateResult = await UserModel.findOneAndUpdate({ emailAddress: emailAddress }, 
        {accountStatus: status});
    if (!updateResult){
        return ({ result: 'USERNOTFOUND' });
    }

    return ({ result: 'OK' });
}
//-- 20220607-BS-1 (End) --//
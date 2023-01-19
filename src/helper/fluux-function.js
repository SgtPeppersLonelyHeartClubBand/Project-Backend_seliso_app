require('dotenv').config();
const { response } = require('express');
require('log-timestamp');
const https = require('https');

async function SendRequest(dataJSON, url, path) {
    const options = {
        hostname: url,
        port: 5281,
        path: path,
        method: 'POST',
        headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataJSON.length,
                'Authorization': 'Bearer '+process.env.TOKEN,
        },
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, response => {
            response.on('data', data => {
                resolve({ status: response.statusCode, data: data.toString() });
            });
        });

        console.log('dataJSON: ', dataJSON);

        req.on('error', reject);
        req.write(dataJSON);
        req.end();
    });
}

exports.CheckUser = async(email, serverName) => {
    let userName = email.replace("@", "_at_");
    var dataJSON = JSON.stringify({
        user: userName,
        host: serverName,
    });
    const urlPath = '/api/check_account/';

    console.log('cmd: CheckUser');
    let sendRequestResult = await SendRequest(dataJSON, serverName, urlPath);
    console.log('result: ', sendRequestResult);

    if (sendRequestResult.status != 200) {
        console.log({ErrorMsg: sendRequestResult.data, ServerReq: serverName});
        return ({ result: 'NOK' });
    } 
    if (sendRequestResult.data === '0') return ({ result: 'USEREXISTS' });
    return ({ result: 'OK' });
}

exports.CreateUser = async(email, password, serverName) => {
    let userName = email.replace("@", "_at_");
    var dataJSON = JSON.stringify({
        user: userName,
        password: password,
        server: serverName,
    });
    const urlPath = '/api/create_account/';

    console.log('cmd: CreateUser');
    let sendRequestResult = await SendRequest(dataJSON, serverName, urlPath);
    console.log('result: ', sendRequestResult);

    if (sendRequestResult.status != 200){
        console.log({ErrorMsg: sendRequestResult.data, ServerReq: serverName});
        return ({ result: 'NOK' });
    }
    return ({ result: 'OK' });
}

exports.DeleteUser = async(email, serverName) => {
    let userName = email.replace("@", "_at_");
    var dataJSON = JSON.stringify({
        user: userName,
        server: serverName,
    });
    const urlPath = '/api/delete_account/';

    console.log('cmd: DeleteUser');
    let sendRequestResult = await SendRequest(dataJSON, serverName, urlPath);
    console.log('result: ', sendRequestResult);

    if (sendRequestResult.status != 200){
        console.log({ErrorMsg: sendRequestResult.data, ServerReq: serverName});
        return ({ result: 'NOK' });
    }
    return ({ result: 'OK' });
}

exports.ChangePassword = async(email, newPassword, serverName) => {
    let userName = email.replace("@", "_at_");
    var dataJSON = JSON.stringify({
        user: userName,
        host: serverName,
        newpass: newPassword,
    });
    console.log('input: ', email, newPassword, serverName);
    console.log('input dataJSON: ', dataJSON);

    const urlPath = '/api/change_password/';

    console.log('cmd: ChangePassword');    
    let sendRequestResult = await SendRequest(dataJSON, serverName, urlPath);
    console.log('result: ', sendRequestResult);

    if (sendRequestResult.status != 200){
        console.log({ErrorMsg: sendRequestResult.data, ServerReq: serverName});
        return ({ result: 'NOK' });
    }
    return ({ result: 'OK' });
}
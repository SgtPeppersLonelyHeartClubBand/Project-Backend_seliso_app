var CryptoJS = require("crypto-js");

exports.encrypt = (userName, key = "") => {
    var encryptedMsg = CryptoJS.AES.encrypt(userName, key);
    return encryptedMsg.toString();
}

exports.decrypt = (encryptedMsg, key = "") =>{
    var code = CryptoJS.AES.decrypt(encryptedMsg, key);
    var decryptedMessage = code.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
}

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const outputLen = 20;

exports.generateString = () => {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < outputLen; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
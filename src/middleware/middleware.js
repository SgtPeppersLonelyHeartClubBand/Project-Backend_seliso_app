
const OtherFunction = require('../helper/other-function');

require('log-timestamp');
require('dotenv').config();

/*
Role Test
Admin:  U2FsdGVkX1+MvoMHMn6wDFcQi9jopRj7ILR8i29S3rShoZYZubYfvPGK11FuS+vi
Normal:  U2FsdGVkX18lIfgCN4XTGkmGIoyzyKAQilv1dreNFSxCy9ZfTMIvg/L9IC+X4VBl
*/


const key = process.env.SECRET_KEY;

exports.checkToken = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(403).json({ result: 'No credential sent!' });
    }

    console.log('masuk 1');
    
    let auth = req.headers.authorization.split(" ");
    console.log(auth);

    if ((auth[0] != 'Bearer') || (auth.length != 2)){
        return res.status(403).json({ result: 'No credential sent!' });
    }
    
    let decryptedContent;
    try{
        decryptedContent = JSON.parse(OtherFunction.decrypt(auth[1], key));
    } catch (e){
        return res.status(403).json({ result: 'Invalid credential!' });
    }
    
    console.log('decryptedContent: ',decryptedContent);

    /* 
     * Expected Decrypt Content:
     * {
     *      user: userName,
     *      role: roleName (number: 0 => highest role, 1, 2, 3.. etc)
     * }
     */    

    if (decryptedContent.role != 0){
        return res.status(403).json({ result: 'User is not authorized!' });
    }

    next();
}
const mongodbHostFunction = require('../../helper/mongodb-host-function');
require('log-timestamp');

const apiString = "Server Management Rest API";
const version = "v1";

exports.testAPI = async (req, res, next) => {    
    res.json({ Msg: apiString, Version: version });
    res.status(200).send();
}

exports.register = async (req, res, next) => {
    if (!req.body){
        res.json({ error: 'No Parameters' });
        res.status(400).send();
        return;
    }

    let regData = req.body;
    let result = await mongodbHostFunction.CreateFluuxHost(regData.serverName, regData.priority);
    console.log('result:', result);
    res.json(result);
    res.status(200).send();
}

exports.listAllServer = async (req, res, next) => {
    let result = await mongodbHostFunction.GetAllHostsCapacity();
    res.json(result);
    res.status(200).send();
}

exports.deleteServer = async (req, res, next) => {
    if (typeof req.query.serverName === 'undefined'){
        res.json({ error: 'ServerName parameter not found' });
        res.status(400).send();
        return;
    }

    let serverName = req.query.serverName;
    let getResult = await mongodbHostFunction.DeleteFluuxHost(serverName);
    res.json({ result: getResult });
    res.status(200).send();
}

exports.updatePriority = async (req, res, next) => {
    if (!req.body){
        res.json({ error: 'No Parameters' });
        res.status(400).send();
        return;
    }

    let updateData = req.body;
    let result = await mongodbHostFunction.UpdatePriority( updateData.serverName, updateData.priority );
    res.json(result);
    res.status(200).send();
}


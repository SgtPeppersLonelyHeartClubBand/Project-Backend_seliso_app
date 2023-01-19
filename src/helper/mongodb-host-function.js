const HostModel = require("../models/host")
require('log-timestamp');

let dateTime = require("node-datetime");
let dt = dateTime.create();
let formatted = dt.format("Y-m-d H:M:S");

exports.CreateFluuxHost = async (serverName, priority) => {
    let serverExists = await HostModel.exists({serverName: serverName});
    if (serverExists) return ({result: "Server Exists"});

    const hostData = new HostModel({
        createdAt: formatted,
        updatedAt: formatted,
        serverName: serverName,
        priority: priority
    });

    await hostData.save();    
    return ({result: 'OK'});
}

exports.GetAllHostsCapacity = async () => {
    let findResult = await HostModel.find({ }).sort('priority');
    return findResult;
}

exports.DeleteFluuxHost = async (serverName) => {
    let deleteResult = await HostModel.findOneAndDelete({ serverName: serverName });
    if (!deleteResult) {
        return ({ result: 'ServerName Not Found' });
    }

    return ({ result: 'OK' });
}

exports.DecreaseHostCapacity = async (serverName) => {
    let updateResult = await HostModel.findOneAndUpdate({ serverName: serverName }, 
        { $inc: { capacityLeft: -1 }});
    if (!updateResult){
        return ({ result: 'ServerName Not Found' });
    }

    return ({ result: 'OK' });
}

exports.IncreaseHostCapacity = async (serverName) => {
    let updateResult = await HostModel.findOneAndUpdate({ serverName: serverName }, 
        { $inc: { capacityLeft: 1 }});
    if (!updateResult){
        return ({ result: 'ServerName Not Found' });
    }

    return ({ result: 'OK' });
}

exports.UpdatePriority = async (serverName, newPriority) => {
    let updateResult = await HostModel.findOneAndUpdate({ serverName: serverName }, 
        {priority: newPriority, updatedAt: formatted});
    if (!updateResult){
        return ({ result: 'ServerName Not Found' });
    }

    return ({ result: 'OK' });
}
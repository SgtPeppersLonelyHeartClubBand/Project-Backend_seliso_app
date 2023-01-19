
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    capacityLeft: {
        type: Number,
        default: 100000
    },

    serverName: {
        type: String,
        default: '',
        unique: true
    },

    priority:{
        type: Number,
        default: 0 //0 = highest priority
    },

    createdAt: {
        type: String,
        default: ''
    },

    updatedAt: {
        type: String,
        default: ''
    }
});

var hosts = new mongoose.model('Hosts', schema);

module.exports = hosts;
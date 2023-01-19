
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    accountStatus: {
        type: String,
        default: 'inactive'
    },

    createdAt: {
        type: String,
        default: ''
    },

    createdBy: {
        type: String,
        default: 'sysadmin'
    },

    emailAddress: {
        type: String,
        required: true,
        unique: true
    },

    jabberID: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        default: ''
    },

    serverName: {
        type: String,
        default: ''
    },

    subscriptionStatus: {
        type: String,
        default: 'unsubscribed'
    },

    updatedAt: {
        type: String,
        default: ''
    },

    userName: {
        type: String,
        required: true,
        unique: true
    }

});

var user = new mongoose.model('User', schema);

module.exports = user;
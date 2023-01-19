const express = require('express');
const usersRouterV1 = require('./routes/v1/user-router');
const serversRouterV1 = require('./routes/v1/server-router');
const verifyRouterV1 = require('./routes/v1/verify-router');
const dbConfig = require('../configs/database.js');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

require('log-timestamp');

const key = process.env.SECRET_KEY;

const port = process.env.PORT;

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Databse Connected Successfully!!");    
}).catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/v1/user', usersRouterV1);
app.use('/api/v1/server', serversRouterV1);
app.use('/api/v1/verify', verifyRouterV1);

function onStart(){
    console.log('Server running on port: ', port);
    console.log('Email Verification Host:', process.env.VERIFY_HOST);
}

app.listen(port, onStart);

module.exports = app;
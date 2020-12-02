var Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var config = require("./config.json");

const url = 'mongodb://192.168.1.185:27017';
let userdata;

MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db("codebot");
    userdata = db.collection("userdata");

    client.close();
});

exports.localUserdata = {}
exports.users = userdata;
exports.client = new Discord.Client();
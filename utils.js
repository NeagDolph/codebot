const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const config = require("./config.json");

const url = `mongodb://${config.mongo.hostname}:${config.mongo.port}`;
let db;

MongoClient.connect(url)
    .then(client => {;
        console.log("Connected successfully to server");
        db = client.db(config.mongo.dbName);

        // client.close();
    })
    .catch(err => {
        console.log("Error connecting to MongoDB", err)
    })


module.exports = {
    localUserdata: {},
    client: new Discord.Client(),
    getDb() {
        return db
    }
};
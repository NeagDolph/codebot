var Discord = require('discord.js');
var Engine = require('tingodb')();
var config = require("config.json");

var db = new Engine.Db(config.dbPath, {});

module.exports.users = db.db("users")
module.exports.client = new Discord.Client();
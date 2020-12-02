require('dotenv').config()

var config = require("./config.json");
var commands = require("./commands");

var utils = require("./utils");
var client = utils.client;


client.once('ready', () => {
	console.log("Bot Ready.")
});

client.on('message', message => {
	if (message.content.startsWith(config.prefix + "history")) { //history command
        message.reply
    }
});

client.login(process.env.TOKEN);

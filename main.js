require('dotenv').config()

var config = require("./config.json");
var commands = require("./commands");
var functions = require("./functions");

var utils = require("./utils");
var client = utils.client;


client.once('ready', () => {
	console.log("Bot Ready.")
});

client.on('message', message => {
	if (message.content.startsWith(config.prefix + "history")) { //history command
        let commandResponse = commands.history(message.author.id);
        functions.reply(message, commandResponse, config.interactDirect)
            .catch(err => console.log(err));
    } else if (message.content.split("`").length - 1 >= 2) {
        functions.storeBlock(message)
    }

});

client.login(process.env.TOKEN);

require('dotenv').config()

let config = require("./config.json");
let commands = require("./commands/history");
let functions = require("./functions");
let customutils = require("./customutils");
let Discord = require('discord.js');
let fs = require("fs");

let utils = require("./utils");
let client = utils.client;

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command)
})

client.once('ready', () => {
	console.log("Bot Ready.")
});

client.on('message', message => {
    if (!message.content.startsWith(config.forcedPrefix) || message.author.bot) return;

	let args = message.content.slice(config.forcedPrefix.length).trim().split(/ +/);
    let command = args.shift().toLowerCase();
    
    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    //Bookmark code
	if (reaction.emoji.name === config.emoji.saved) {
        customutils.extractBlocks(reaction.message.content);

        
    }

});

client.login(process.env.TOKEN);

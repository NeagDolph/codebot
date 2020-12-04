let utils = require("../utils");
let config = require("../config.json");
let functions = require("../functions");
let Discord = require('discord.js');

module.exports = {
    name: 'Help',
    usage: 'help',
    description: 'Shows information for available commands',
	execute: async function(message, messageArgs) {
        let prefix;

        if (config.allowCustomPrefix) {
            let db = utils.getDb();
            let result = await db.collection("serverdata").findOne({_id: message.guild.id});
            prefix = result.prefix;
        } else prefix = config.forcedPrefix;

        var commandsEmbed = new Discord.MessageEmbed()
            .setTitle('Commands')
            .setColor("#3403b7")
            .setAuthor('CodeBot', 'https://i.imgur.com/LRG4fLY.jpg')
            .setDescription('Save and refer back to code blocks')
    
        utils.client.commands.forEach(command => {
            if (command.auth) {
                if (!command.auth(message)) return;
            }
            commandsEmbed.addField(command.name, `Usage: ${prefix + command.usage}\n${command.description}`)
        })

        message.channel.send(commandsEmbed);
    }
};

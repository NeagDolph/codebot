let utils = require("../utils");
let config = require("../config.json");
let functions = require("../functions");

async function historyReactions(message, page, user, usermessage) {
    const filter = (reaction, reactionUser) => (reaction.emoji.name === config.emoji.leftEmoji || reaction.emoji.name === config.searchEmoji || reaction.emoji.name === config.right) && user.id === reactionUser.id;

    try {
        let collected = await message.awaitReactions(filter, { max: 1, maxUsers: 1, time: 60000, errors: ['time'] })
        
        const reaction = collected.first();

        if (reaction.emoji.name == config.emoji.leftEmoji || reaction.emoji.name == config.right) {
            let desiredPage = page + (reaction.emoji.name == config.emoji.left ? -1 : 1)
            let historyMsg = await functions.getHistory(user.id, desiredPage)
            let formattedReply = `**History** Page ${historyMsg.page}\n\n` + historyMsg.content + `\n${historyMsg.page > 1 ? config.emoji.leftEmoji + " Last Page | " : ""}${config.searchEmoji} Go to page | ${config.right} Next Page`

            message.edit(formattedReply)
            console.log("MESSAGE REACTION REMOVE");
            message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));

            if (desiredPage > 1) await message.react(config.emoji.left);
            await message.react(config.emoji.search);
            await message.react(config.emoji.right);

            historyReactions(message, page, user)
        } else {
            let pageRequest = await functions.reply(usermessage, "Type the page you'd like to navigate to", false)

            pageRequest.channel.awaitMessages(m => !isNaN(m.content), { max: 1, time: 15000, errors: ['time'] })
                .then(collected => {
                    let collectedMessage = collected.first();
                    let desiredPage = Number(collectedMessage.content);
                    pageRequest.delete();
                    collectedMessage.delete();

                    functions.getHistory(user.id, desiredPage)
                        .then(historyMsg => {
                            let formattedReply = `**History** Page ${historyMsg.page}\n\n` + historyMsg.content + `\n${historyMsg.page > 1 ? config.emoji.leftEmoji + " Last Page | " : ""}${config.searchEmoji} Go to page | ${config.right} Next Page`

                            message.edit(formattedReply)
                            message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                
                            if (desiredPage > 1) message.react(config.emoji.leftEmoji).then(() => message.react(config.searchEmoji)).then(() => message.react(config.right));
                            else message.react(config.emoji.searchEmoji).then(() => message.react(config.right));

                            historyReactions(message, page, user)
                        })
                        .catch(err => {
                            console.log("Error retrieving user history", err)
                        })
                })
                .catch(collected => {
                    pageRequest.delete();
                });
        }
    } catch (err) {
        console.log("History timed out", err)
    }
}

module.exports = {
    name: 'History',
    usage: `history [page_number]`,
    description: 'Shows the user their previously used code blocks!',
	execute: async function(message, messageArgs) {
        let historyMsg = await functions.getHistory(message.author.id, isNaN(messageArgs[0]) ? 1 : parseInt(messageArgs[0]));
    
        let formattedReply = `**History** Page ${historyMsg.page}\n\n` + historyMsg.content + `\n${historyMsg.page > 1 ? config.emoji.leftEmoji + " Last Page | " : ""}${config.searchEmoji} Go to page | ${config.right} Next Page`
    
        let reply = await functions.reply(message, formattedReply, false);
    
        if (historyMsg.page > 1) await reply.react(config.emoji.left);
        await reply.react(config.emoji.search);
        await reply.react(config.emoji.right);
    
        this.historyReactions(reply, historyMsg.page, message.author, message).catch(err => console.error(err))
    },
    historyReactions
};

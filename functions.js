var utils = require("./utils");
var client = utils.client;
var users = utils.users;
var config = require("./config.json");
var customutils = require("./customutils");

var functions = {}

let extractBlocks = customutils.extractBlocks;
let getUser = customutils.getUser;


functions.storeBlock = async(message, bookmark=false) => {
    let userid = message.author.id;
    let time = message.createdTimestamp;
    let messageData = message.content;
    let userdata = await getUser(userid);

    if (!userdata) {
        userdata = {userid, singleLineWarned: false, singleLineSaving: true, codeMessages: []}
        await users.insert(userdata);
    }

    console.log("store block! This:", functions, "  Message:", messageData)
    let extracted = extractBlocks(messageData)
    let singleCount = extracted.reduce((tot, el) => tot + (el.single ? 1 : 0), 0);


    //Confirm single line settings for user
    if ((singleCount > 0 && !userdata.singleLineWarned) && config.singleBlock) {
        let newMessage = await functions.reply(message, `Hey <@${userid}>! Looks like this is your first time using single-line code blocks. Would you like me to save them in the future?`);

        //Preemptively set singlelinewarned
        users.updateOne({userid}, {$set: {singleLineWarned: true}});

        await newMessage.react(config.successEmoji)
        await newMessage.react(config.errorEmoji)

        const filter = (reaction, user) => [config.errorEmoji, config.successEmoji].includes(reaction.emoji.name) && user.id === message.author.id;

         newMessage.awaitReactions(filter, { max: 1, maxUsers: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                let singleLineSaving = collected.first().emoji.name === config.successEmoji;
                users.updateOne({userid}, {$set: {singleLineSaving}});
            })
            .catch(err => {
                users.updateOne({userid}, {$set: {singleLineWarned: false}});
                console.log(err)
            })
    }

    //contruct message object
    codeMessage = {
        codeblocks: extracted,
        message: messageData,
        time
    }

    users.updateOne({userid: userid}, {$push: {codeMessages: codeMessage}});

    message.react(config.savedEmoji);
}

functions.reply = async(message, response) => {
    if (config.interactDirect) {
        let dmChannel
        if (message.author.dmChannel) dmChannel = message.author.dmChannel;
        else dmChannel = await message.author.createDM();

        let addedReaction = await message.react(config.successEmoji);

        let sentMessage = await dmChannel.send(response)
        console.log("Sent message: ", sentMessage.content);
    } else {
        let sentMessage = await message.channel.send(response);
        console.log("Sent message: ", sentMessage.content);
    }
}

module.exports = functions;

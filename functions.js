let utils = require("./utils");
let client = utils.client;
let config = require("./config.json");
let customutils = require("./customutils");

let functions = {}

let extractBlocks = customutils.extractBlocks;
let getUser = customutils.getUser;

functions.getHistory = async(userid, page) => {
    let user = await customutils.getUser(userid);

    console.log("user", user)

    let calculatedPage = page * 10 > user.codeMessages.length + 9 ? Math.ceil((user.codeMessages.length + 9) / 10) : page; //In case requested page cannot exist
    
    let trimmedMessages = user.codeMessages.slice(10 * (calculatedPage - 1), 10 * calculatedPage);

    let parsed = trimmedMessages.map((el, idx) => {
        let longblocks = el.codeblocks.reduce((o, el) => o + (el.single ? 0 : 1), 0)

        let showMsg = longblocks === 0;

        if (!showMsg) var returnBlocks = el.codeblocks.map(el => el.single ? "" : "```" + el.content + "```\n")
        console.log("Showmsg", showMsg, el.message)

        return `${idx} - \n${showMsg ? el.message : returnBlocks.join("\n")}`
    })

    return {content: parsed.join("\n\n"), page: calculatedPage}
}


functions.storeBlock = async(message, bookmark=false) => {
    let db = utils.getDb();

    let userid = message.author.id;
    let time = message.createdTimestamp;
    let messageData = message.content;
    let userdata = await getUser(userid);

    message.react(config.emoji.saved);

    if (!userdata) {
        userdata = {_id: userid, singleLineWarned: false, singleLineSaving: true, codeMessages: []}
        await db.collection("userdata").insert(userdata);
    }

    console.log("store block! This:", functions, "  Message:", messageData);
    let extracted = extractBlocks(messageData);
    let singleCount = extracted.reduce((tot, el) => tot + (el.single ? 1 : 0), 0);
    


    //Confirm single line settings for user
    if ((singleCount > 0 && !userdata.singleLineWarned) && config.saveSingleBlock) {
        let newMessage = await functions.reply(message, `Looks like this is your first time using single-line code blocks. Would you like me to save them in the future?`);

        await newMessage.react(config.emoji.success)
        await newMessage.react(config.emoji.error)

        const filter = (reaction, user) => (reaction.emoji.name === config.emoji.errorEmoji || reaction.emoji.name === config.success) && user.id === userid;

        newMessage.awaitReactions(filter, { max: 1, maxUsers: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                console.log("collected")
                let singleLineSaving = collected.first().emoji.name === config.emoji.success;
                db.collection("userdata").updateOne({_id: userid}, {$set: {singleLineSaving, singleLineWarned: true}});
                newMessage.delete();
            })
            .catch(err => {
                db.collection("userdata").updateOne({_id: userid}, {$set: {singleLineWarned: false}});
                console.log(err)
            })
    }

    //contruct message object
    codeMessage = {
        codeblocks: extracted,
        message: messageData,
        time
    }

    db.collection("userdata").updateOne({_id: userid}, {$push: {codeMessages: codeMessage}});
}

functions.reply = async(message, response, dm=true) => {
    if (config.dmOnly && dm) {
        let dmChannel
        if (message.author.dmChannel) dmChannel = message.author.dmChannel;
        else dmChannel = await message.author.createDM();

        // let addedReaction = await message.react(config.emoji.success);

        let sentMessage = await dmChannel.send(response)
        console.log("Sent message: ", sentMessage.content);

        return sentMessage
    } else {
        response = response + `<@${message.author.id}>, ` 

        let sentMessage = await message.channel.send(response);
        console.log("Sent message: ", sentMessage.content);

        return sentMessage
    }
}



module.exports = functions;

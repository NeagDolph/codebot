let utils = require("../utils");
let config = require("../config.json");
let functions = require("../functions");

module.exports = {
    name: 'prefix',
    usage: "prefix [new_prefix]",
    auth(message) {
        return message.member.hasPermission("ADMINISTRATOR") && config.allowCustomPrefix
    },
    description: 'View the current prefix or set a new one',
	execute(message, messageArgs) {
        if (this.auth(message)) {
            let db = utils.getDb();
            db.collection("serverdata").updateOne({_id: message.guild.id}, {$set: {prefix: messageArgs.join(" ")}})
                .then(() => {
                    functions.reply(message, 'Prefix has been updated to `' + messageArgs.join(" ") + "`")
                })
                .catch(err => console.error(err))
        }
    }
}

var utils = require("./utils");
var client = utils.client;

var commands = {}

commands.history = (userid) => {
    console.log("showing history")

    return "history"
}

module.exports = commands;


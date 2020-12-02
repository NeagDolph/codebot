const utils = require("./utils");
const users = utils.users;


const extractBlocks = (content) => {
    let blocks = content.match(/(```(.|\n)+```)|(`{1,2}(.|\n)+`{1,2})/g)

    return blocks.map(block => {
        if (block.match(/`/g).length >= 6) {
            return {
                single: false,
                content: block.substring(3, block.length - 3)
            }
        } else {
            return {
                single: true,
                content: block.substring(1, block.length - 1)
            }
        }
    })
}

const getUser = (userid) => {
    return new Promise((res, rej) => {
        users.findOne({userid}, function(err, item) {
            if (err) rej(err);

            res(item)
        });
    })
}

exports.extractBlocks = extractBlocks;
exports.getUser = getUser;
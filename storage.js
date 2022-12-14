let fs = require('fs');
const store = new Map();
var JSONStore = require('json-store');
var db = JSONStore(__dirname + '/database.json');
exports.storeDiscordTokens = async function (userId, tokens) {
	await store.set(`discord-${userId}`, tokens);
}

exports.getDiscordTokens = async function(userId) {
	return store.get(`discord-${userId}`);
}

exports.commandsSet = async function (userId, number) {
	await db.set(`commands-${userId}`, number);
}
exports.commandsGet = async function(userId) {
    let file = JSON.parse(fs.readFileSync(__dirname + '/database.json').toString("utf8"));
	return file[`commands-${userId}`] == undefined ? 0 : file[`commands-${userId}`];
}

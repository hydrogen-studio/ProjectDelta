
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
	return db.get(`commands-${userId}`) == undefined ? 0 : db.get(`commands-${userId}`);
}
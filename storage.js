let fs = require('fs');
const store = new Map();
var JSONStore = require('json-store');
var db = JSONStore(__dirname + '/database.json');
var premiumdb = JSONStore(__dirname + '/premium.json');
var lfmdb = JSONStore(__dirname + '/lfm.json');
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

exports.premiumSet = async function (userId, data) {
	await premiumdb.set(`premium-${userId}`, JSON.stringify(data));
}
exports.premiumGet = async function(userId) {
    let file = JSON.parse(fs.readFileSync(__dirname + '/premium.json').toString("utf8"));
	return file[`premium-${userId}`] == undefined ? 0 : JSON.parse(file[`premium-${userId}`]);
}


exports.lastfmSet = async function (userId, data) {
	await lfmdb.set(`lfmuser-${userId}`, JSON.stringify(data));
}
exports.lastfmGet = async function(userId) {
    let file = JSON.parse(fs.readFileSync(__dirname + '/lfm.json').toString("utf8"));
	return file[`lfmuser-${userId}`] == undefined ? null : JSON.parse(file[`lfmuser-${userId}`]);
}
exports.lastfmDel = async function (userId) {
	await lfmdb.del(`lfmuser-${userId}`);
}

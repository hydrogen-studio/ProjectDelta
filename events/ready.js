const { Events } = require('discord.js');
const { refreshPremium } = require('../utils/utilities');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.user.setPresence({ activities: [{ name: client.shard.ids[0].toString() }] });
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
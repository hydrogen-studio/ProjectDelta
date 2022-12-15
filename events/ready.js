const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.user.setPresence({ activities: [{ name: '/info premium to purchase ProjectOmega!' }] });
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
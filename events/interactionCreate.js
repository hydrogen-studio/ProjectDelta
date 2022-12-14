const { Events } = require('discord.js');
const { commandsSet, commandsGet } = require('../storage.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
			let number = await commandsGet(interaction.user.id) + 1;
			console.log(number)
			commandsSet(interaction.user.id, number);
		}
		catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};
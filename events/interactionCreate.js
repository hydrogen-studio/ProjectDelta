const { Events, EmbedBuilder } = require('discord.js');
const { commandsSet, commandsGet } = require('../storage.js');
const { checkPremium } = require('../utils/utilities.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand()) return;
		// console.log(interaction.guild.members.cache)

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		if(command.premium == true){
			if(checkPremium(interaction, client) == false){
				
			const premiumEmbed = new EmbedBuilder()
				.setTitle("Premium Only Command")
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setDescription(`**This command is only available to our premium users!**`)
				.setColor(0x0099FF)
				.addFields(
					{ name: 'Purchase Premium Here', value: "[Purchase for $2.99/month](https://discord.com/servers/projectdelta-1052444692672937984)", inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
					await interaction.reply({ embeds: [premiumEmbed], ephemeral: true });
				return;
			}
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
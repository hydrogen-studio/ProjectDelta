const { Events, EmbedBuilder } = require('discord.js');
const { commandsSet, commandsGet } = require('../storage.js');
const { checkPremium } = require('../utils/utilities.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand()) return;

		if(interaction.inGuild() == false){
				
			const dmEmbed = new EmbedBuilder()
				.setTitle("Server Only Command")
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setDescription(`**This command is only available in a server, not dms!**`)
				.setColor(0x0099FF)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
				await interaction.reply({ embeds: [dmEmbed], ephemeral: true });
				return;
		}

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		// 1: server
		// 2: user
		// 3: plus

		if(command.premium == 1){
			let premium = await checkPremium(interaction.user);
			console.log(premium)
			if(premium != 1 && premium != 3){
				
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
		}else if(command.premium == 2){
			let premium = await checkPremium(interaction.user);
			console.log(premium)
			if(premium != 2 && premium != 3){
				
			const premiumEmbed = new EmbedBuilder()
				.setTitle("Premium Only Command")
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setDescription(`**This command is only available to our premium users!**`)
				.setColor(0x0099FF)
				.addFields(
					{ name: 'Purchase Premium Here', value: "[Purchase for $2.99/month](https://www.patreon.com/projectdeltaplus)", inline: true },
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
			commandsSet(interaction.user.id, number);
		}
		catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};
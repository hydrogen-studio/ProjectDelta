const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/utilities.js');

module.exports = {
	premium: 0,
	data: new SlashCommandBuilder()
		.setName('premium')
		.setDescription('Information about ProjectDelta\'s Premium program'),
	async execute(interaction) {
		const premiumEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Premium Information')
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
			.setDescription("Thank you for considering ProjectDelta's Premium program! We have 3 tiers that you can chose from, and each tier gives you more and more benefits. You can see the benefits of each tier by visiting [our patreon page](https://www.patreon.com/projectdeltaplus).")
			.addFields({ name: 'Caution', value: "You must be in our [Discord Server]() for premium to take effect." })
			.setTimestamp()
			.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

		await interaction.reply({ embeds: [premiumEmbed] });
            
	},
};
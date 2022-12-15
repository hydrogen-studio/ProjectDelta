const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/utilities.js');

module.exports = {
	premium: true,
	data: new SlashCommandBuilder()
		.setName('projectomega')
		.setDescription('Project Omega at it\'s finest!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('information')
				.setDescription('Information about ProjectOmega!')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'information') {
			const pingEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Premium Information')
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setDescription("Welcome to ProjectOmega! Thank you for purchasing ProjectOmega!")
				.addFields(
					{ name: 'Support Information', value: 'Because you have access to this message, you are in the support server. There is a series of channels you have access to, where you could receive priority support!' },
					{ name: 'Exclusive Events', value: `Examples of the events may include Listening Parties, Watch Parties, Development Streams, etc. THey will also take place under the ProjectOmega category under our official discord server.` },
				)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

			await interaction.reply({ embeds: [pingEmbed] });
            
		}
	},
};
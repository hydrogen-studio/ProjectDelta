const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('All the commands that contains information about the bot.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('ping')
				.setDescription('The response times of the bot!'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('bot')
				.setDescription('Bot Information!')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'user') {
			const user = interaction.options.getUser('target') ? interaction.options.getUser('target') : interaction.user;
			const serverMember = interaction.guild.members.cache.get(user.id);
			const userEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('User Info')
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.setDescription(`Information about ${user.username}`)
				.setColor(serverMember.displayHexColor)
				.addFields(
					{ name: 'User Tag', value: user.tag, inline: true },
					{ name: 'Server Nickname', value: serverMember.displayName, inline: true },
					{ name: 'User Type', value: user.bot? 'Bot' : 'User', inline: true },
					{ name: 'User ID', value: user.id, inline: true },
					{ name: 'Creation Time', value: formatTime(user.createdAt), inline: true },
					{ name: 'Server Joined Time', value: formatTime(serverMember.joinedAt), inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
			await interaction.reply({ embeds: [userEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'server') {
			await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
		}
		else if (interaction.options.getSubcommand() === 'ping') {
			const pingEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Pong!')
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setDescription('Response Time of ' + interaction.client.user.username)
				.addFields(
					{ name: 'Client Ping', value: interaction.client.ws.ping + 'ms', inline: true },
					{ name: 'Message Ping', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

			await interaction.reply({ embeds: [pingEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'bot') {
			await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
		}
	},
};
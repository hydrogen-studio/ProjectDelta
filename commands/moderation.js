const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { formatTime, checkPremium } = require('../utils/utilities.js');

module.exports = {
	premium: 0,
	data: new SlashCommandBuilder()
		.setName('moderation')
		.setDescription('All the commands that helps moderating a server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addSubcommand(subcommand =>
			subcommand
				.setName('kick')
				.setDescription('Kick a user!')
				.addUserOption(option => option.setName('target').setDescription('The user').setRequired(true))
				.addStringOption(option => option.setName('reason').setDescription('The reason for the kick!')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('ban')
				.setDescription('Ban a user!')
				.addUserOption(option => option.setName('target').setDescription('The user').setRequired(true))
				.addStringOption(option => option.setName('reason').setDescription('The reason for the ban!'))
				.addNumberOption(option => option.setName('days').setDescription('[ProjectDelta Server Only!] Days of message to delete!').addChoices(
					{ name: '0 Days', value: 0 },
					{ name: '1 Day', value: 1 },
					{ name: '2 Days', value: 2 },
					{ name: '3 Days', value: 3 },
					{ name: '4 Days', value: 4 },
					{ name: '5 Days', value: 5 },
					{ name: '6 Days', value: 6 },
					{ name: '7 Days', value: 7 }
				))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'kick') {
			const user = interaction.options.getUser('target') ? interaction.options.getUser('target') : interaction.user;
			const serverMember = interaction.guild.members.cache.get(user.id);
            await interaction.reply("Attempting to kick " + user.username + "...");
            if(serverMember.kickable){
			const reason = interaction.options.getString('reason') == undefined || interaction.options.getString('reason') == null || interaction.options.getString('reason') == "" ? 'No reason provided.' : interaction.options.getString('reason');
			
			await interaction.guild.members.kick(user, `Banned by ${interaction.user.username} | ` + reason);
			const userEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('User Kicked.')
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.setDescription(`${user.username} has been kicked from the server!`)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
				if(interaction.options.getString('reason') != null && interaction.options.getString('reason') != undefined){
					userEmbed.addFields({ name: "reason", "value": reason, "inline": false });
				}
			    await interaction.editReply({ embeds: [userEmbed] });
            }else{
                const userEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('User Cannot Be Kicked.')
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.setDescription(`I do not have permission to kick ${user.username}!`)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
			    await interaction.editReply({ embeds: [userEmbed] });
            }
		}else if (interaction.options.getSubcommand() === 'ban') {
			const user = interaction.options.getUser('target') ? interaction.options.getUser('target') : interaction.user;
			const serverMember = interaction.guild.members.cache.get(user.id);
			const reason = interaction.options.getString('reason') == undefined || interaction.options.getString('reason') == null || interaction.options.getString('reason') == "" ? 'No reason provided.' : interaction.options.getString('reason');
            
			const days = interaction.options.getNumber('days')
			await interaction.reply("Attempting to ban " + user.username + "...");
			let premiumCheck = await checkPremium(interaction.user)
			if(premiumCheck != 1 && days != null && days != undefined && premiumCheck != 3){
				const premiumEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('ProjectDelta Server required to set time to delete the user\'s messages!')
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setDescription(`Please purchase ProjectDelta Server to unlock this feature!`)
				.setURL('https://www.patreon.com/projectdeltaplus')
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
				await interaction.editReply({ embeds: [premiumEmbed] });
				return;
			}
            if(serverMember.bannable){
                await interaction.guild.members.ban(user, { days: days, reason: `Banned by ${interaction.user.username} | ` + reason });
                const userEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('User Banned.')
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.setDescription(`${user.username} has been banned from the server!`)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
			if(interaction.options.getString('reason') != null && interaction.options.getString('reason') != undefined){
				userEmbed.addFields({ name: "reason", "value": reason, "inline": false });
			}
			    await interaction.editReply({ embeds: [userEmbed] });
            }else{
                const userEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('User Cannot Be Banned.')
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.setDescription(`I do not have permission to ban ${user.username}!`)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
			    await interaction.editReply({ embeds: [userEmbed] });
            }
		}
	},
};
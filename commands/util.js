const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/utilities.js');

module.exports = {
	premium: false,
	data: new SlashCommandBuilder()
		.setName('util')
		.setDescription('Utilities at it\'s finest!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('8ball')
				.setDescription('Spin the 8 ball!')
				.addStringOption(option => option.setName('question').setDescription('Question you want me to accurately answer').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('coin')
                .setDescription('Flip a coin!')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === '8ball') {
            
            let question = interaction.options.getString('question')
            const responses = [
                'it is certain',
                'it is decidedly so',
                'without a doubt',
                'yes — definitely',
                'you may rely on it',
                'as I see it, yes',
                'most likely',
                'outlook good',
                'yes',
                'signs point to yes',
                'reply hazy, try again',
                'ask again later',
                'better not tell you now',
                'cannot predict now',
                'concentrate and ask again',
                'don’t count on it',
                'my reply is no',
                'my sources say no',
                'outlook not so good',
                'very doubtful'
              ]
			const ballEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('8ball')
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.addFields(
					{ name: 'Question', value: question },
                    { name: 'Answer', value: responses[Math.floor(Math.random() * responses.length)] },
				)
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

			await interaction.reply({ embeds: [ballEmbed] });
            
		}else if (interaction.options.getSubcommand() === 'coin') {
            let res = ["Heads", "Tails"]
            let coin = res[Math.floor(Math.random() * res.length)];

            const coinEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Coin')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: 'Result', value: coin },
            )
            .setTimestamp()
            .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

            await interaction.reply({ embeds: [coinEmbed] });
        }
	},
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lastfmSet, lastfmGet, lastfmDel } = require('../storage.js');
const { checkPremium } = require('../utils/utilities.js');
const { LASTFM_API } = require("../config.json");
var axios = require('axios');

module.exports = {
	premium: 0,
	data: new SlashCommandBuilder()
		.setName('lastfm')
		.setDescription('LastFM commands!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('latest')
				.setDescription('Your latest scrobbles!')
				.addUserOption(option => option.setName('user').setDescription('The user you want me to get the scrobbles for')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setuser')
                .setDescription('Set the username of the user!')
				.addStringOption(option => option.setName('username').setDescription('Your LastFM Username!').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear LASTFM username from databse!'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('topartists')
                .setDescription('[ProjectDelta User & Plus only] Get your top artists!')
				.addUserOption(option => option.setName('user').setDescription('The user you want me to get the stop artists for'))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'latest') {
            
            let user = interaction.options.getUser('user') == undefined ? interaction.user : interaction.options.getUser('user');
            let username = await lastfmGet(user.id);
            if(username == null){
                let description =  interaction.options.getUser('user') == undefined ? `You have not set your LastFM username! Use \`/lastfm setuser\` to set your username!` : `${user.username} has not set their LastFM username!`;
                const errorEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('No LastFM Username Found!')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(description)
                    .setTimestamp()
                    .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

                await interaction.reply({ embeds: [errorEmbed] });
                return
            }

            var config = {
            method: 'post',
            url: 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username.username + '&api_key=' + LASTFM_API + '&format=json',
            headers: { }
            };

            axios(config)
            .then(async function (response) {
                let data = response.data.recenttracks.track[0];
                let author = response.data.recenttracks['@attr']
                let np = (data['@attr'] != undefined && data['@attr']['nowplaying'] == "true") ? " | Currently Playing" : ""
                const ballEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Latest Track - ' + data.name)
                .setURL(data.url)
                .setThumbnail(data.image[2]['#text'])
                .setAuthor({ name: author.user, iconURL: user.displayAvatarURL() })
                .addFields({
                    name: 'Track',
                    value: data.name,
                    inline: true
                },
                {
                    name: 'Artist',
                    value: data.artist['#text'],
                    inline: true
                },
                {
                    name: 'Album',
                    value: data.album['#text'],
                    inline: true
                })
                .setTimestamp()
                .setFooter({ text: `Total Scrobbles: ${author['total']}` + np  });

                await interaction.reply({ embeds: [ballEmbed] });
            })
            .catch(async function (error) {
                // todo: handle error
                if(error.response == undefined){
                    const errorEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Error')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription("An error has occured! Please try again later! If this error persists, please contact the bot developers!")
                    .setTimestamp()
                    .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

                    await interaction.reply({ embeds: [errorEmbed] });
                    return
                }
                let code = error.response.status
                if(code == 404){
                    
                    const errorEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Invalid Username')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription("I cannot find an account with that username! Please make sure you have set your LastFM username correctly!")
                    .setTimestamp()
                    .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

                    await interaction.reply({ embeds: [errorEmbed] });
                }
            });

            
		}else if (interaction.options.getSubcommand() === 'setuser') {
            let username = interaction.options.getString('username');
            
            lastfmSet(interaction.user.id, { "username": username });

            const setEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('LastFM Username Set!')
            .setDescription(`Your LastFM username has been set to ${username}`)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: `Use /lastfm clear to clear the username from our database!` });

            await interaction.reply({ embeds: [setEmbed] });
        }else if (interaction.options.getSubcommand() === 'clear') {
            lastfmDel(interaction.user.id);

            const setEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('LastFM Username Cleared!')
            .setDescription(`Your LastFM username has been cleared from our database!`)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: `Use /lastfm setuser anytime to start using lastfm again!` });

            await interaction.reply({ embeds: [setEmbed] });
        }if (interaction.options.getSubcommand() === 'topartists') {
			let premiumCheck = await checkPremium(interaction.user)
            if(premiumCheck != 2 && premiumCheck != 3){
				const premiumEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('ProjectDelta User or Plus required to see LastFM stats!')
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setDescription(`Please purchase ProjectDelta User or Plus to unlock this feature!`)
				.setURL('https://www.patreon.com/projectdeltaplus')
				.setTimestamp()
				.setFooter({ text: `Thank you for using ${interaction.client.user.username}` });
				await interaction.reply({ embeds: [premiumEmbed] });
				return;
			}
            let user = interaction.options.getUser('user') == undefined ? interaction.user : interaction.options.getUser('user');
            let username = await lastfmGet(user.id);
            if(username == null){
                let description =  interaction.options.getUser('user') == undefined ? `You have not set your LastFM username! Use \`/lastfm setuser\` to set your username!` : `${user.username} has not set their LastFM username!`;
                const errorEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('No LastFM Username Found!')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(description)
                    .setTimestamp()
                    .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

                await interaction.reply({ embeds: [errorEmbed] });
                return
            }

            var config = {
            method: 'post',
            url: 'https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=' + username.username + '&api_key=' + LASTFM_API + '&format=json',
            headers: { }
            };

            axios(config)
            .then(async function (response) {
                let data = response.data.topartists.artist;
                let topArtists = [];
                for(i in data){
                    if(i >= 10) break;
                    topArtists.push({ name: `Top ${(parseInt(i) + parseInt(1))}`, value: data[i].name});
                }
                const ballEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Top 10 artists for ' + user.username)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .addFields(topArtists)
                .setTimestamp();

                await interaction.reply({ embeds: [ballEmbed] });
            })
            .catch(async function (error) {
                console.log(error)
                // todo: handle error
                if(error.response == undefined){
                    const errorEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Error')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription("An error has occured! Please try again later! If this error persists, please contact the bot developers!")
                    .setTimestamp()
                    .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

                    await interaction.reply({ embeds: [errorEmbed] });
                    return
                }
                let code = error.response.status
                if(code == 404){
                    
                    const errorEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Invalid Username')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription("I cannot find an account with that username! Please make sure you have set your LastFM username correctly!")
                    .setTimestamp()
                    .setFooter({ text: `Thank you for using ${interaction.client.user.username}` });

                    await interaction.reply({ embeds: [errorEmbed] });
                }
            });

            
		}
	},
};
require('dotenv').config(); // Load environment variables from a .env file
const { Client, GatewayIntentBits, ActivityType, PermissionsBitField, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const fs = require('fs'); // Import the file system module
const { measureMemory } = require('vm');



const client = new Client({ // Create a new instance of the Client class
    intents: [
        GatewayIntentBits.Guilds, // Enable the GUILDS intent
        GatewayIntentBits.GuildMessages, // Enable the GUILD_MESSAGES intent
        GatewayIntentBits.MessageContent, // Enable the MESSAGE_CONTENT intent
    ],
});

const logChannelId = process.env.CHANNELID; // Get the log channel ID from environment variables


client.on("ready", (c) => { // Listen for the ready event
    console.log(`🟢 Logged in as ${client.user.tag}`); // Log the bot's tag
    console.log("🟠 WILL NOT RESPOND! If message sent by a bot"); // Log a message indicating the bot will not respond to other bots
    client.user.setActivity({ // Set the bot's activity status
        name: ".help", // Activity name
        type: ActivityType.Listening, // Activity type
    });
});


client.on("messageCreate", async (message) => { // Listen for the messageCreate event
    const logMessage = (log) => { // Function to log messages
        const logChannel = client.channels.cache.get(logChannelId); // Get the log channel
        if (logChannel) { // Check if the log channel exists
            logChannel.send(log); // Send the log message to the log channel
        }
        fs.appendFileSync('command_logs.txt', log + '\n'); // Append the log message to the command_logs.txt file
    };

    if (message.author.bot) { // Check if the message author is a bot
        return; // If the author is a bot, return
    }

    if (message.content === '=ping') { // Check if the message content is .ping
        const sent = await message.channel.send({ embeds: [new EmbedBuilder().setDescription('Pinging...')] }); // Send an embed message to the channel
        const timeDiff = sent.createdTimestamp - message.createdTimestamp; // Calculate the time difference
        const embed = new EmbedBuilder() // Create a new embed
            .setColor(0x505050) // Set the embed color
            .setTitle('Zephyr status:') // Set the embed title
            .setDescription(`<:action_green:1300069365567459430>  The bot is online! \n \n<:w_yell:1300080206345801809>  Latency is ${timeDiff}ms.`) // Set the embed description
            .setTimestamp() // Set the embed timestamp
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }); // Set the embed footer

        await sent.edit({ embeds: [embed] }); // Edit the message to include the embed
        logMessage(`Ping command used by ${message.author.tag} - Latency: ${timeDiff}ms`); // Log the command usage
    }

    if (message.content.startsWith('=test')) {
        const args = message.content.split(' ').slice(1); // Get the arguments
        let response = [];

        if (args.includes('/t')) {
            response.push("yes");
        }
        if (args.includes('/e')) {
            response.push("no");
        }
        if (args.includes('/f')) {
            response.push("maybe");
        }

        if (response.length === 0) {
            const invalidEmbed = new EmbedBuilder()
                .setColor(0x505050) // Red color for error
                .setTitle('<:mod_red:1300068904021786736>  Invalid Command')
                .setDescription('The arguments provided are invalid. Please use one of the following arguments: /t, /e, /f.')
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.channel.send({ embeds: [invalidEmbed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0x505050)
                .setTitle('<:mod_green:1300069043914670082>  Test Command Successful')
                .setDescription(response.join(', '))
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        }
    }   
    
});

client.login(process.env.TOKEN); // Log in to the Discord API with the bot's token
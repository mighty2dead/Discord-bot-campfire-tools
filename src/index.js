require('dotenv').config(); // Load environment variables from a .env file
const { Client, GatewayIntentBits, ActivityType, PermissionsBitField, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const fs = require('fs'); // Import the file system module
const { measureMemory } = require('vm');
const warnHandler = require('./warn_handler'); // Import the warn handler module
const banHandler = require('./srs/commands/ban-handler'); // Import the ban handler module

const client = new Client({ // Create a new instance of the Client class
    intents: [
        GatewayIntentBits.Guilds, // Enable the GUILDS intent
        GatewayIntentBits.GuildMessages, // Enable the GUILD_MESSAGES intent
        GatewayIntentBits.MessageContent, // Enable the MESSAGE_CONTENT intent
    ],
});

const logChannelId = process.env.CHANNELID; // Get the log channel ID from environment variables
let lastBannedMemberId = null; // Variable to store the last banned member's ID
const warnsFile = 'logs.txt'; // File to store warnings

// Ensure the warns file exists
if (!fs.existsSync(warnsFile)) { // Check if the warns file does not exist
    fs.writeFileSync(warnsFile, ''); // Create an empty warns file
}

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

    if (message.content === "kys") { //Listens for suicidal people
        message.reply("Keep yourself safe :heart:"); //tells them not to kill themselves
        console.log("Command executed kys"); //logs that fact that the preson is retarded
        console.log("By user: ", message.author.tag); //specifies the person.
    }
    
    if (message.content === ".help") { // Check if the message content is ".help"
        const helpEmbed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color
            .setTitle('Bot Commands') // Set the embed title
            .setDescription('Here are the available commands and how to use them:') // Set the embed description
            .addFields( // Add fields to the embed
                { name: '.ping', value: 'Replies with "Pong!".\n**Example:** `.ping`' }, // Add the .ping command
                { name: '.help', value: 'Displays this help message.\n**Example:** `.help`' }, // Add the .help command
                { name: '.hey', value: 'Replies with "Hello there!".\n**Example:** `.hey`' }, // Add the .hey command
                { name: '.ban', value: 'Bans a mentioned member.\n**Example:** `.ban @user [duration in seconds]`' }, // Add the .ban command
                { name: '.unban', value: 'Unbans a user by ID.\n**Example:** `.unban user_id`' }, // Add the .unban command
                { name: '.warn', value: 'Warns a mentioned member.\n**Example:** `.warn @user [reason]`' }, // Add the .warn command
                { name: '.unwarn', value: 'Removes all warnings for a mentioned member.\n**Example:** `.unwarn @user`' }, // Add the .unwarn command
                { name: '.listwarns', value: 'Lists all warnings for a mentioned member.\n**Example:** `.listwarns @user`' }, // Add the .listwarns command
                { name: '.delwarn', value: 'Deletes a specific warning for a mentioned member by index.\n**Example:** `.delwarn @user [index]`' } // Add the .delwarn command
            )
            .setFooter({ text: 'Use these commands responsibly!' }); // Set the embed footer

        message.reply({ embeds: [helpEmbed] }); // Reply with the help embed
        console.log("🟢 Executed command .help"); // Log the command execution
        console.log("🔵 By user", message.author.tag); // Log the user who executed the command
    }

    if (message.content === ".hey") { // Check if the message content is ".hey"
        const startTime = Date.now(); // Get the current timestamp
        const embed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color
            .setDescription("Hello there!"); // Set the embed description

        const reply = await message.reply({ embeds: [embed] }); // Reply with the embed
        const endTime = Date.now(); // Get the current timestamp
        const responseTime = endTime - startTime; // Calculate the response time

        const updatedEmbed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color
            .setDescription(`Hello there! (Response time: ${responseTime} ms)`); // Set the embed description with the response time
        
        await reply.edit({ embeds: [updatedEmbed] }); // Edit the reply with the updated embed
        logMessage(`🟢 Executed command .hey by ${message.author.tag} with response time ${responseTime} ms`); // Log the command execution with the response time
    }

    if (message.content.startsWith(".ban")) { // Check if the message content starts with ".ban"
        banHandler.handleBanCommand(message); // Call the handleBanCommand function from the ban handler module
    }

    if (message.content.startsWith(".unban")) { // Check if the message content starts with ".unban"
        banHandler.handleUnbanCommand(message); // Call the handleUnbanCommand function from the ban handler module
    }
    
    if (message.content.startsWith(".warn")) { // Check if the message content starts with ".warn"
        if (message.content.startsWith(".listwarns")) { // Check if the message content starts with ".listwarns"
            warnHandler.handleListWarnsCommand(message); // Call the handleListWarnsCommand function from the warn handler module
        }

        if (message.content.startsWith(".unwarn")) { // Check if the message content starts with ".unwarn"
            warnHandler.handleUnwarnCommand(message); // Call the handleUnwarnCommand function from the warn handler module
        }

        if (message.content.startsWith(".delwarn")) { // Check if the message content starts with ".delwarn"
            warnHandler.handleDelWarnCommand(message); // Call the handleDelWarnCommand function from the warn handler module
        }
        warnHandler.handleWarnCommand(message); // Call the handleWarnCommand function from the warn handler module
    }
});

client.login(process.env.TOKEN); // Log in to the Discord API with the bot's token
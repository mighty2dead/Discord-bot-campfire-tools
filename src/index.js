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
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) { // Check if the member has the BanMembers permission
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("You do not have permission to ban members."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Ban command attempted without permission by user", message.author.tag); // Log the permission error
            return; // Exit the command
        }

        const args = message.content.split(' '); // Split the message content into arguments
        const member = message.mentions.members.first(); // Get the first mentioned member
        const duration = args[2] ? parseInt(args[2], 10) * 1000 : null; // Parse the duration from the arguments and convert to milliseconds

        if (!member) { // Check if a valid member was mentioned
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("Please mention a valid member to ban."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Ban command attempted without mentioning a user by", message.author.tag); // Log the error
            return; // Exit the command
        }

        if (!member.bannable) { // Check if the member is bannable
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("I cannot ban this member."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Ban command attempted on a non-bannable user by", message.author.tag); // Log the error
            return; // Exit the command
        }

        try {
            await member.ban(); // Ban the member
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xffd5f6) // Set the embed color to blue
                .setDescription(`${member.user.tag} has been banned.`); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🟢 Executed command .ban on user", member.user.tag, "by", message.author.tag); // Log the command execution
        } catch (err) {
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("I was unable to ban the member."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.error("🔴 Error banning user", member.user.tag, "by", message.author.tag, "Error:", err); // Log the error
        }
    }

    if (message.content.startsWith(".unban")) { // Check if the message content starts with ".unban"
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) { // Check if the member has the BanMembers permission
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("You do not have permission to unban members."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Unban command attempted without permission by user", message.author.tag); // Log the permission error
            return; // Exit the command
        }

        const args = message.content.split(' '); // Split the message content into arguments
        const userId = args[1]; // Get the user ID from the arguments
        if (!userId) { // Check if a user ID was provided
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("Please provide a user ID to unban."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Unban command attempted without providing a user ID by", message.author.tag); // Log the error
            return; // Exit the command
        }

        // Validate the user ID format
        if (!/^\d+$/.test(userId)) { // Check if the user ID is a valid number
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red
                .setDescription("Invalid user ID format."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Unban command attempted with invalid user ID format by", message.author.tag); // Log the error
            return; // Exit the command
        }

        try {
            await message.guild.bans.remove(userId); // Unban the user
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xffd5f6) // Set the embed color to blue
                .setDescription(`User with ID ${userId} has been unbanned.`); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🟢 Executed command .unban on user with ID", userId, "by", message.author.tag); // Log the command execution
        } catch (err) {
            if (err.code === 10026) { // Check if the error code is Unknown Ban
                const embed = new EmbedBuilder() // Create a new embed
                    .setColor(0xff0000) // Set the embed color to red
                    .setDescription("This user is not banned."); // Set the embed description
                message.reply({ embeds: [embed] }); // Reply with the embed
                console.log("🔴 Unban command attempted on a user who is not banned by", message.author.tag); // Log the error
            } else {
                const embed = new EmbedBuilder() // Create a new embed
                    .setColor(0xff0000) // Set the embed color to red
                    .setDescription("I was unable to unban the user."); // Set the embed description
                message.reply({ embeds: [embed] }); // Reply with the embed
                console.error("🔴 Error unbanning user with ID", userId, "by", message.author.tag, "Error:", err); // Log the error
            }
        }
    }

    if (message.content.startsWith(".warn")) { // Check if the message content starts with ".warn"
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { // Check if the member has the ManageMessages permission
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("You do not have permission to warn members."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Warn command attempted without permission by user", message.author.tag); // Log the permission error
            return; // Exit the command
        }
    
        const member = message.mentions.members.first(); // Get the first mentioned member
        if (!member) { // Check if a valid member was mentioned
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("Please mention a valid member to warn."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Warn command attempted without mentioning a user by", message.author.tag); // Log the error
            return; // Exit the command
        }
    
        const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided'; // Get the reason from the message content or use a default reason
        const warnEntry = `${member.id},${member.user.tag},${reason}\n`; // Create a warning entry
        fs.appendFileSync(warnsFile, warnEntry); // Append the warning entry to the warns file
        const embed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color to pink
            .setDescription(`${member.user.tag} has been warned. Reason: ${reason}`); // Set the embed description
        message.reply({ embeds: [embed] }); // Reply with the embed
        console.log("🟢 Executed command .warn on user", member.user.tag, "by", message.author.tag); // Log the command execution
    }
    
    if (message.content.startsWith(".unwarn")) { // Check if the message content starts with ".unwarn"
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { // Check if the member has the ManageMessages permission
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("You do not have permission to unwarn members."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Unwarn command attempted without permission by user", message.author.tag); // Log the permission error
            return; // Exit the command
        }
    
        const member = message.mentions.members.first(); // Get the first mentioned member
        if (!member) { // Check if a valid member was mentioned
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("Please mention a valid member to unwarn."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Unwarn command attempted without mentioning a user by", message.author.tag); // Log the error
            return; // Exit the command
        }
    
        const warns = fs.readFileSync(warnsFile, 'utf-8').split('\n').filter(Boolean); // Read the warns file and split it into lines, filtering out empty lines
        const updatedWarns = warns.filter(warn => !warn.startsWith(`${member.id},`)); // Filter out the warnings for the specified member
        fs.writeFileSync(warnsFile, updatedWarns.join('\n') + '\n'); // Write the updated warns list back to the file
        const embed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color to pink
            .setDescription(`${member.user.tag} has been unwarned.`); // Set the embed description
        message.reply({ embeds: [embed] }); // Reply with the embed
        console.log("🟢 Executed command .unwarn on user", member.user.tag, "by", message.author.tag); // Log the command execution
    }
    
    if (message.content.startsWith(".listwarns")) { // Check if the message content starts with ".listwarns"
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { // Check if the member has the ManageMessages permission
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("You do not have permission to list warns."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 List warns command attempted without permission by user", message.author.tag); // Log the permission error
            return; // Exit the command
        }
    
        const member = message.mentions.members.first(); // Get the first mentioned member
        if (!member) { // Check if a valid member was mentioned
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("Please mention a valid member to list warns."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 List warns command attempted without mentioning a user by", message.author.tag); // Log the error
            return; // Exit the command
        }
    
        const warns = fs.readFileSync(warnsFile, 'utf-8').split('\n').filter(Boolean); // Read the warns file and split it into lines, filtering out empty lines
        const memberWarns = warns.filter(warn => warn.startsWith(`${member.id},`)); // Filter the warnings for the specified member
        if (memberWarns.length === 0) { // Check if the member has no warnings
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xffd5f6) // Set the embed color to pink
                .setDescription(`${member.user.tag} has no warnings.`); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🟢 Executed command .listwarns on user", member.user.tag, "by", message.author.tag); // Log the command execution
            return; // Exit the command
        }
    
        const warnList = memberWarns.map((warn, index) => { // Map the member's warnings to a list
            const [id, tag, reason] = warn.split(','); // Split the warning entry into components
            return `${index + 1}. Reason: ${reason}`; // Return the formatted warning entry
        }).join('\n'); // Join the list into a single string
        const embed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color to pink
            .setDescription(`Warnings for ${member.user.tag}:\n${warnList}`); // Set the embed description
        message.reply({ embeds: [embed] }); // Reply with the embed
        console.log("🟢 Executed command .listwarns on user", member.user.tag, "by", message.author.tag); // Log the command execution
    }
    
    if (message.content.startsWith(".delwarn")) { // Check if the message content starts with ".delwarn"
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { // Check if the member has the ManageMessages permission
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("You do not have permission to delete warnings."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Delete warn command attempted without permission by user", message.author.tag); // Log the permission error
            return; // Exit the command
        }
    
        const args = message.content.split(' '); // Split the message content into arguments
        const member = message.mentions.members.first(); // Get the first mentioned member
        const warnIndex = parseInt(args[2], 10) - 1; // Parse the warning index from the arguments and adjust for zero-based index
    
        if (!member) { // Check if a valid member was mentioned
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("Please mention a valid member to delete a warning."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Delete warn command attempted without mentioning a user by", message.author.tag); // Log the error
            return; // Exit the command
        }
    
        if (isNaN(warnIndex) || warnIndex < 0) { // Check if the warning index is valid
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("Please provide a valid warning index."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Delete warn command attempted with invalid index by", message.author.tag); // Log the error
            return; // Exit the command
        }
    
        const warns = fs.readFileSync(warnsFile, 'utf-8').split('\n').filter(Boolean); // Read the warns file and split it into lines, filtering out empty lines
        const memberWarns = warns.filter(warn => warn.startsWith(`${member.id},`)); // Filter the warnings for the specified member
    
        if (warnIndex >= memberWarns.length) { // Check if the warning index is out of range
            const embed = new EmbedBuilder() // Create a new embed
                .setColor(0xff0000) // Set the embed color to red for error
                .setDescription("Invalid warning index."); // Set the embed description
            message.reply({ embeds: [embed] }); // Reply with the embed
            console.log("🔴 Delete warn command attempted with out-of-range index by", message.author.tag); // Log the error
            return; // Exit the command
        }
    
        memberWarns.splice(warnIndex, 1); // Remove the specified warning from the member's warnings
        const updatedWarns = warns.filter(warn => !warn.startsWith(`${member.id},`)).concat(memberWarns); // Update the warns list by removing the member's warnings and adding the updated warnings
        fs.writeFileSync(warnsFile, updatedWarns.join('\n') + '\n'); // Write the updated warns list back to the file
        const embed = new EmbedBuilder() // Create a new embed
            .setColor(0xffd5f6) // Set the embed color to pink
            .setDescription(`Warning ${warnIndex + 1} for ${member.user.tag} has been deleted.`); // Set the embed description
        message.reply({ embeds: [embed] }); // Reply with the embed
        console.log("🟢 Executed command .delwarn on user", member.user.tag, "by", message.author.tag); // Log the command execution
    }
});

client.login(process.env.TOKEN); // Log in to the Discord API with the bot's token

//ok
//ok

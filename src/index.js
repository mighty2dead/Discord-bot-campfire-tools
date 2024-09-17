require('dotenv').config(); // Load environment variables
const { Client, IntentsBitField, ActivityType, PermissionsBitField } = require('discord.js'); // Import the necessary classes from discord.js
const fs = require('fs'); // Import the file system module
const client = new Client({ // Create a new instance of the Client class
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages, // Add the GUILD_MESSAGES intent
        IntentsBitField.Flags.MessageContent,  // Add the MESSAGE_CONTENT intent
]
});

const logChannelId = 'YOUR_LOG_CHANNEL_ID'; // Replace with your log channel ID
let lastBannedMemberId = null; // Store the last banned member's ID ],


client.on("ready", (c) => { // Listen for the ready event
    console.log(`🟢 Logged in as ${client.user.tag}`); // Log the bot's tag
    console.log("🟠 WILL NOT RESPOND! If message sent by a bot"); 
    client.user.setActivity({
        name: ".help",
        type: ActivityType.Listening,
    })
});

client.on("messageCreate", async (message) => { // Listen for the messageCreate event
    const logMessage = (log) => {
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send(log);
        }
        fs.appendFileSync('command_logs.txt', log + '\n');
    };
    
    
    if (message.content === ".ping") { // Check if the message content is ".ping"
        return; // If the author is a bot, return
    }
    
    if (message.content === ".ping") { // Check if the message content is ".ping"
        message.reply("Pong!");     // Reply with "Pong!"
        console.log("🟢 Executed command .ping"); // Log the command execution
        console.log("🔵 By user: ", message.author.tag); // Log the user who executed the command
    }
    if (message.content === ".help") {
        message.reply("Mate so theres 3 commands. One is hey, the other one is gay, and the 3rd one is ping. That simple!")
        console.log("🟢 Executed command .help")
        console.log("🔵 By user", message.author.tag)
    }
    if (message.content === ".hey") {
        message.reply("Hello there!")
        console.log("🟢 Executed command .hey")
        console.log("🔵 By user", message.author.tag)
    }

    if (message.content.startsWith(".ban")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const duration = args[2] ? parseInt(args[2], 10) * 1000 : null; // Duration in seconds ban members.");
            console.log("🔴 Ban command attempted without permission by user", message.author.tag);
            return;
        }

        /**
         * Retrieves the first mentioned member in a Discord message.
         * 
         * @constant {GuildMember} member - The first mentioned member in the message.
         * @param {Message} message - The Discord message object.
         * @returns {GuildMember | undefined} The first mentioned member, or undefined if no members are mentioned.
         */
        const member = message.mentions.members.first();
        if (!member) {
            message.reply("Please mention a valid member to ban.");
            console.log("🔴 Ban command attempted without mentioning a user by", message.author.tag);
            return;
        }

        if (!member.bannable) {
            message.reply("I cannot ban this member.");
            console.log("🔴 Ban command attempted on a non-bannable user by", message.author.tag);
            return;
        }

        try {
            await member.ban();
            message.reply(`${member.user.tag} has been banned.`);
            console.log("🟢 Executed command .ban on user", member.user.tag, "by", message.author.tag);
        } catch (err) {
            message.reply("I was unable to ban the member.");
            console.error("🔴 Error banning user", member.user.tag, "by", message.author.tag, "Error:", err);
        }
    }

    if (message.content.startsWith(".unban")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log("🔴 Unban command attempted without permission by user", message.author.tag);
            return;
        }

        const args = message.content.split(' ');
        const userId = args[1];
        if (!userId) {
            message.reply("Please provide a user ID to unban.");
            console.log("🔴 Unban command attempted without providing a user ID by", message.author.tag);
            return;
        }

        // Validate the user ID format
        if (!/^\d+$/.test(userId)) {
            message.reply("Invalid user ID format.");
            console.log("🔴 Unban command attempted with invalid user ID format by", message.author.tag);
            return;
        }

        try {
            await message.guild.bans.remove(userId);
            message.reply(`User with ID ${userId} has been unbanned.`);
            console.log("🟢 Executed command .unban on user with ID", userId, "by", message.author.tag);
        } catch (err) {
            if (err.code === 10026) { // Unknown Ban error code
                message.reply("This user is not banned.");
                console.log("🔴 Unban command attempted on a user who is not banned by", message.author.tag);
            } else {
                message.reply("I was unable to unban the user.");
                console.error("🔴 Error unbanning user with ID", userId, "by", message.author.tag, "Error:", err);
            }
        }
    }
});

client.on("interactionCreate", (interaction) => { // Listen for the interactionCreate event
    if (!interaction.isChatInputCommand()) return; // Check if the interaction is a chat input command
    console.log(interaction.commandName); // Log the command name
    
    if (interaction.commandName === "add") { // Check if the command name is "hey"
        const num1 = interaction.options.get('first-number');
        const num2 = interaction.options.get('second-option');
        
        interaction.reply(`The sum of ${num1} and ${num2} is ${num1 + num2}`);
    }
});

client.login(process.env.TOKEN); // Log in to the Discord API with the bot's token

//ok
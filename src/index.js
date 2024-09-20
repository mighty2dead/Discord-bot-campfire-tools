require('dotenv').config(); // Load environment variables
const { Client, GatewayIntentBits, ActivityType, PermissionsBitField } = require('discord.js'); // Import the necessary classes from discord.js
const fs = require('fs'); // Import the file system module

const client = new Client({ // Create a new instance of the Client class
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // Add the GUILD_MESSAGES intent
        GatewayIntentBits.MessageContent,  // Add the MESSAGE_CONTENT intent
    ],
});

const logChannelId = process.env.CHANNELID; // Replace with your log channel ID
let lastBannedMemberId = null; // Store the last banned member's ID
const warnsFile = 'logs.txt'; // File to store warnings

// Ensure the warns file exists
if (!fs.existsSync(warnsFile)) {
    fs.writeFileSync(warnsFile, '');
}

client.on("ready", (c) => { // Listen for the ready event
    console.log(`🟢 Logged in as ${client.user.tag}`); // Log the bot's tag
    console.log("🟠 WILL NOT RESPOND! If message sent by a bot"); 
    client.user.setActivity({
        name: ".help",
        type: ActivityType.Listening,
    });
});

client.on("messageCreate", async (message) => { // Listen for the messageCreate event
    const logMessage = (log) => {
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send(log);
        }
        fs.appendFileSync('command_logs.txt', log + '\n');
    };

    if (message.author.bot) { // Check if the message author is a bot
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
            message.reply("You do not have permission to ban members.");
            console.log("🔴 Ban command attempted without permission by user", message.author.tag);
            return;
        }

        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const duration = args[2] ? parseInt(args[2], 10) * 1000 : null; // Duration in seconds

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
            message.reply("You do not have permission to unban members.");
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

    if (message.content.startsWith(".warn")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            message.reply("You do not have permission to warn members.");
            console.log("🔴 Warn command attempted without permission by user", message.author.tag);
            return;
        }

        const member = message.mentions.members.first();
        if (!member) {
            message.reply("Please mention a valid member to warn.");
            console.log("🔴 Warn command attempted without mentioning a user by", message.author.tag);
            return;
        }

        const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided';
        const warnEntry = `${member.id},${member.user.tag},${reason}\n`;
        fs.appendFileSync(warnsFile, warnEntry);
        message.reply(`${member.user.tag} has been warned. Reason: ${reason}`);
        console.log("🟢 Executed command .warn on user", member.user.tag, "by", message.author.tag);
    }

    if (message.content.startsWith(".unwarn")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            message.reply("You do not have permission to unwarn members.");
            console.log("🔴 Unwarn command attempted without permission by user", message.author.tag);
            return;
        }

        const member = message.mentions.members.first();
        if (!member) {
            message.reply("Please mention a valid member to unwarn.");
            console.log("🔴 Unwarn command attempted without mentioning a user by", message.author.tag);
            return;
        }

        const warns = fs.readFileSync(warnsFile, 'utf-8').split('\n').filter(Boolean);
        const updatedWarns = warns.filter(warn => !warn.startsWith(`${member.id},`));
        fs.writeFileSync(warnsFile, updatedWarns.join('\n') + '\n');
        message.reply(`${member.user.tag} has been unwarned.`);
        console.log("🟢 Executed command .unwarn on user", member.user.tag, "by", message.author.tag);
    }

    if (message.content.startsWith(".listwarns")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            message.reply("You do not have permission to list warns.");
            console.log("🔴 List warns command attempted without permission by user", message.author.tag);
            return;
        }

        const member = message.mentions.members.first();
        if (!member) {
            message.reply("Please mention a valid member to list warns.");
            console.log("🔴 List warns command attempted without mentioning a user by", message.author.tag);
            return;
        }

        const warns = fs.readFileSync(warnsFile, 'utf-8').split('\n').filter(Boolean);
        const memberWarns = warns.filter(warn => warn.startsWith(`${member.id},`));
        if (memberWarns.length === 0) {
            message.reply(`${member.user.tag} has no warnings.`);
            console.log("🟢 Executed command .listwarns on user", member.user.tag, "by", message.author.tag);
            return;
        }

        const warnList = memberWarns.map((warn, index) => {
            const [id, tag, reason] = warn.split(',');
            return `${index + 1}. Reason: ${reason}`;
        }).join('\n');
        message.reply(`Warnings for ${member.user.tag}:\n${warnList}`);
        console.log("🟢 Executed command .listwarns on user", member.user.tag, "by", message.author.tag);
    }

    if (message.content.startsWith(".delwarn")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            message.reply("You do not have permission to delete warnings.");
            console.log("🔴 Delete warn command attempted without permission by user", message.author.tag);
            return;
        }

        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const warnIndex = parseInt(args[2], 10) - 1;

        if (!member) {
            message.reply("Please mention a valid member to delete a warning.");
            console.log("🔴 Delete warn command attempted without mentioning a user by", message.author.tag);
            return;
        }

        if (isNaN(warnIndex) || warnIndex < 0) {
            message.reply("Please provide a valid warning index.");
            console.log("🔴 Delete warn command attempted with invalid index by", message.author.tag);
            return;
        }

        const warns = fs.readFileSync(warnsFile, 'utf-8').split('\n').filter(Boolean);
        const memberWarns = warns.filter(warn => warn.startsWith(`${member.id},`));

        if (warnIndex >= memberWarns.length) {
            message.reply("Invalid warning index.");
            console.log("🔴 Delete warn command attempted with out-of-range index by", message.author.tag);
            return;
        }

        memberWarns.splice(warnIndex, 1);
        const updatedWarns = warns.filter(warn => !warn.startsWith(`${member.id},`)).concat(memberWarns);
        fs.writeFileSync(warnsFile, updatedWarns.join('\n') + '\n');
        message.reply(`Warning ${warnIndex + 1} for ${member.user.tag} has been deleted.`);
        console.log("🟢 Executed command .delwarn on user", member.user.tag, "by", message.author.tag);
    }
});

client.login(process.env.TOKEN); // Log in to the Discord API with the bot's token

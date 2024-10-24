const { PermissionsBitField, EmbedBuilder } = require('discord.js');

async function handleBanCommand(message) {
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
}

async function handleUnbanCommand(message) {
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
}

module.exports = {
    handleBanCommand,
    handleUnbanCommand
};
require('dotenv').config(); // Load environment variables
const { Client, IntentsBitField, messageLink, ActivityType } = require('discord.js'); // Import the Client and IntentsBitField classes from discord.js
const client = new Client({ // Create a new instance of the Client class
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages, // Add the GUILD_MESSAGES intent
        IntentsBitField.Flags.MessageContent,  // Add the MESSAGE_CONTENT intent
    ],
});

client.on("ready", (c) => { // Listen for the ready event
    console.log(`🟢 Logged in as ${client.user.tag}`); // Log the bot's tag
    console.log("🟠 WILL NOT RESPOND! If message sent by a bot"); 
    client.user.setActivity({
        name: ".help",
        type: ActivityType.Listening,
    })
});

client.on("messageCreate", (message) => { // Listen for the messageCreate event
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
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            message.reply("You do not have permission to ban members.");
            console.log("🔴 Ban command attempted without permission by user", message.author.tag);
            return;
        }

        const member = message.mentions.members.first();
        if (!member) {
            message.reply("Please mention a valid member to ban.");
            console.log("🔴 Ban command attempted without mentioning a user by", message.author.tag);
            return;
        }

        member.ban()
            .then(() => {
                message.reply(`${member.user.tag} has been banned.`);
                console.log("🟢 Executed command .ban on user", member.user.tag, "by", message.author.tag);
            })
            .catch(err => {
                message.reply("I was unable to ban the member.");
                console.error("🔴 Error banning user", member.user.tag, "by", message.author.tag, "Error:", err);
            });
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
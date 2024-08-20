require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType, embedLength } = require('discord.js');

const commands = [
    {
        name: embed,
        description: "Embeds a message",
        
    },    
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🟠 Started registering application commands")
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log("🟢 Successfully registered application commands");
    } catch (error) {
        console.log("🔴 An error has occurred! Code: ", error);
    }
})();
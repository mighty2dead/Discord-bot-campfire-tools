        require('dotenv').config();
        const client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
            ]
        });

        const logChannelId = 'YOUR_LOG_CHANNEL_ID';
        let lastBannedMemberId = null;

        client.on("ready", (c) => {
            console.log(`🟢 Logged in as ${client.user.tag}`);
            console.log("🟠 WILL NOT RESPOND! If message sent by a bot");
            client.user.setActivity({
                name: ".help",
                type: ActivityType.Listening,
            });
        });

        client.on("messageCreate", async (message) => {
            const logMessage = (log) => {
                const logChannel = client.channels.cache.get(logChannelId);
                if (logChannel) logChannel.send(log);
                fs.appendFileSync('command_logs.txt', log + '\n');
            };

            if (message.author.bot) return;

            const commands = {
                ".ping": () => {
                    message.reply("Pong!");
                    console.log("🟢 Executed command .ping");
                    console.log("🔵 By user:", message.author.tag);
                },
                ".help": () => {
                    message.reply("Mate so theres 3 commands. One is hey, the other one is gay, and the 3rd one is ping. That simple!");
                    console.log("🟢 Executed command .help");
                    console.log("🔵 By user:", message.author.tag);
                },
                ".hey": () => {
                    message.reply("Hello there!");
                    console.log("🟢 Executed command .hey");
                    console.log("🔵 By user:", message.author.tag);
                },
                ".ban": async () => {
                    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                        console.log("🔴 Ban command attempted without permission by user", message.author.tag);
                        return;
                    }

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
                },
                ".unban": async () => {
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
                        if (err.code === 10026) {
                            message.reply("This user is not banned.");
                            console.log("🔴 Unban command attempted on a user who is not banned by", message.author.tag);
                        } else {
                            message.reply("I was unable to unban the user.");
                            console.error("🔴 Error unbanning user with ID", userId, "by", message.author.tag, "Error:", err);
                        }
                    }
                }
            };

            const command = commands[message.content.split(' ')[0]];
            if (command) command();
        });

        client.on("interactionCreate", (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            console.log(interaction.commandName);

            if (interaction.commandName === "add") {
                const num1 = interaction.options.get('first-number').value;
                const num2 = interaction.options.get('second-option').value;
                interaction.reply(`The sum of ${num1} and ${num2} is ${num1 + num2}`);
            }
        });

        client.login(process.env.TOKEN);

const { warn } = require('./index');
const { unwarn, listwarn, delwarn } = require('./index');

module.exports = {
    name: 'warn',
    description: 'Warn a user',
    execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('You need to mention a user to warn them.');
        }

        const reason = args.slice(1).join(' ');
        if (!reason) {
            return message.reply('You need to provide a reason for the warning.');
        }

        warn(user, reason)
            .then(() => {
                message.channel.send(`${user.tag} has been warned for: ${reason}`);
            })
            .catch(error => {
                console.error(error);
                message.reply('There was an error trying to warn the user.');
            });
    },
};

module.exports.unwarn = {
    name: 'unwarn',
    description: 'Remove a warning from a user',
    execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('You need to mention a user to unwarn them.');
        }

        unwarn(user)
            .then(() => {
                message.channel.send(`${user.tag} has been unwarned.`);
            })
            .catch(error => {
                console.error(error);
                message.reply('There was an error trying to unwarn the user.');
            });
    },
};

module.exports.listwarn = {
    name: 'listwarn',
    description: 'List all warnings for a user',
    execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('You need to mention a user to list their warnings.');
        }

        listwarn(user)
            .then(warnings => {
                if (warnings.length === 0) {
                    message.channel.send(`${user.tag} has no warnings.`);
                } else {
                    message.channel.send(`${user.tag} has the following warnings:\n${warnings.join('\n')}`);
                }
            })
            .catch(error => {
                console.error(error);
                message.reply('There was an error trying to list the warnings.');
            });
    },
};

module.exports.delwarn = {
    name: 'delwarn',
    description: 'Delete a specific warning from a user',
    execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('You need to mention a user to delete their warning.');
        }

        const warningIndex = parseInt(args[1], 10);
        if (isNaN(warningIndex)) {
            return message.reply('You need to provide a valid warning index to delete.');
        }

        delwarn(user, warningIndex)
            .then(() => {
                message.channel.send(`Warning ${warningIndex} for ${user.tag} has been deleted.`);
            })
            .catch(error => {
                console.error(error);
                message.reply('There was an error trying to delete the warning.');
            });
    },
};

// warn_handler.js
module.exports = {
    warn: function(message) {
        console.warn(message);
    }
};
module.exports = {
    name: 'rcon',
    description: 'Sends rcon command to server',
    guildOnly: true,
    openttd: true,
    args: true,
    usage: '[command] <[option]>',
    perm: 'admin',
    cooldown: 1,
    execute(message, args) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        const RCONCMD = `${args.join(' ')}`;
        global.logger.trace('got rcon command:', RCONCMD);

        // Check connection
        if (openttd.isConnected) {
            // rcon callback
            const parser = function(rcon) {
                global.logger.trace('got rcon:', rcon);
                message.channel.send(`\`${rcon.output}\``);
            };

            // rconend callback
            const end = function(rconend) {
                global.logger.trace('Got rconend:', rconend);
                openttd.connection.removeListener('rcon', parser);
                openttd.connection.removeListener('rconend', end);
            };

            // Bind to rcon
            openttd.connection.on('rcon', parser);
            openttd.connection.on('rconend', end);
            
            // Send rcon
            openttd.sendRcon(RCONCMD);
        } else {
            message.reply('Not connected');
        }
    }
};
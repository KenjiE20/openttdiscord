module.exports = {
    name: 'password',
    description: 'Asks for the current OpenTTD server\'s password',
    guildOnly: true,
    openttd: true,
    alias: ['pw'],
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        // Check connection
        if (openttd.isConnected) {
            const command = 'setting server_password';

            // rcon callback
            const parser = function(rcon) {
                global.logger.debug(`got rcon: ${JSON.stringify(rcon, null, 4)}`);
                var pw = /Current value for 'server_password' is: '(.*)'/.exec(rcon.output);
                global.logger.trace(JSON.stringify(pw, null, 4));
                if (pw[1]) {
                    message.channel.send(`\`Current password: ${pw[1]}\``);
                } else {
                    message.channel.send('`There is no password for this server`');
                }
            };

            // rconend callback
            const disconnect = function(rconend) {
                global.logger.trace(`Got rconend: ${JSON.stringify(rconend, null, 4)}`);
                if (rconend.command === command) {
                    openttd.connection.removeListener('rcon', parser);
                    openttd.connection.removeListener('rconend', disconnect);
                }
            };

            // Bind to rcon
            openttd.connection.on('rcon', parser);
            openttd.connection.on('rconend', disconnect);

            // Send rcon
            openttd.connection.send_rcon(command);
        } else {
            message.reply('Not connected');
        }
    }
};
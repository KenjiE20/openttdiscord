const pluralize = require('pluralize');

module.exports = {
    name: 'playercount',
    description: 'Get quick player count for the current OpenTTD server\'s game',
    guildOnly: true,
    openttd: true,
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        // Check connection
        if (openttd.isConnected) {
            // Get length of client info var for total
            let count = Object.keys(openttd.clientInfo).length;
            let players = 0;
            let spec = 0;

            // If the server is dedciated, minus 1 for the server
            if (openttd.gameInfo.dedicated) {
                count--;
            }

            // Loop through and count players and spectators
            if (count) {
                for (const client in openttd.clientInfo) {
                    // Skip dedicated
                    if (openttd.gameInfo.dedicated && client === '1') {
                        continue;
                    } else {
                        if (openttd.clientInfo[client].company !== '255') {
                            players += 1;
                        } else {
                            spec += 1;
                        }
                    }
                }
            }

            let reply;
            if(count === 0) {
                reply = 'No players connected.';
            } else {
                reply = `${players} ${pluralize('player', players)} connected, ${spec} ${pluralize('spectator', spec)} connected. ${count} total ${pluralize('client', count)}.`;
            }
            message.reply(`\`${reply}\``);
        } else {
            message.reply('Not connected');
        }
    }
};
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
            // Get length of client info var
            let count = Object.keys(openttd.clientInfo).length;
            // If the server is dedciated, minus 1 for the server
            if (openttd.gameInfo.dedicated) {
                count--;
            }

            let reply;
            switch(count) {
                case 0: reply = 'No players connected.'; break;
                case 1: reply = '1 player connected.'; break;
                default: reply = `${count} players connected.`; break;
            }
            message.reply(`\`${reply}\``);
        } else {
            message.reply('Not connected');
        }
    }
};
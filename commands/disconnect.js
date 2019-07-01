module.exports = {
    name: 'disconnect',
    description: 'Disonnect from the OpenTTD server mapped to this channel',
    guildOnly: true,
    openttd: true,
    execute(message) {
        if (message.author.id === message.client.config.ownerID) {
            // Get the OpenTTD server for the channel
            const openttd = message.client.channelMap.get(message.channel.id);

            // Disconnect
            if (openttd.isConnected) {
                return openttd.disconnect();
            } else {
                message.reply('Not connected');
            }
        }
    }
};
module.exports = {
    name: 'connect',
    description: 'Connect to the OpenTTD server mapped to this channel',
    guildOnly: true,
    openttd: true,
    execute(message) {
        if (message.author.id === message.client.config.ownerID) {
            // Get the OpenTTD server for the channel
            const openttd = message.client.channelMap.get(message.channel.id);

            // Attempt to connect
            if (openttd.isConnected) {
                return message.reply('Already connected');
            } else {
                return openttd.connect();
            }
        }
    }
};
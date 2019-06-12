module.exports = {
    name: 'shutdown',
    description: 'Gracefully shutdown the bot',
    alias: ['kill'],
    execute(message) {
        global.logger.debug(`Message author id: ${message.author.id} | OwnerID: ${message.client.config.ownerID}`);
        if (message.author.id === message.client.config.ownerID) {
            // Attempt to disconnect each OpenTTD config
            global.logger.info('Disconnecting from OpenTTD servers');
            message.client.channelMap.tap(channel => {
                if (channel.isConnected) {
                    global.logger.debug(`Disconnecting from OpenTTD Server: ${channel.name}`);
                    channel.disconnect();
                }
            });
            global.logger.info('Shutting down');
            message.client.destroy();
        }
    }
};
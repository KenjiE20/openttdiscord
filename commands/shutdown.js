module.exports = {
    name: 'shutdown',
    description: 'Gracefully shutdown the bot',
    alias: ['kill'],
    execute(message) {
        global.logger.debug(`Message author id: ${message.author.id} | OwnerID: ${message.client.config.ownerID}`);
        if (message.author.id === message.client.config.ownerID) {
            message.client.botShutdown();
        }
    }
};
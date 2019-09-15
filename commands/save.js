module.exports = {
    name: 'save',
    description: 'Saves the current config',    
    perm: 'owner',
    execute(message) {
        global.logger.info('Saving config');
        message.client.saveBotConfig(message.client.config)
            .then(result => {
                if (result === 'OK') {
                    global.logger.info('Config saved');
                    message.reply('Config saved');
                } else {
                    global.logger.error(`There was an error writing the config:\n${result}`);
                    message.reply('There was an error saving, please see the logs for more details');
                }
            });
    }
};
const fs = require('fs');
module.exports = {
    name: 'save',
    description: 'Saves the current config',
    execute(message) {
        global.logger.debug(`Message author id: ${message.author.id} | OwnerID: ${message.client.config.ownerID}`);
        if (message.author.id === message.client.config.ownerID) {
            global.logger.info('Saving config');
            let data = JSON.stringify(message.client.config, null, 4);
            fs.writeFile('config.json', data, (error) => {
                if (error) {
                    global.logger.error(`There was an error writing the config:\n${error}`);
                    message.reply('There was an error saving, please see the logs for more details');
                }
                else {
                    global.logger.info('Config saved');
                    message.reply('Config saved');
                }
            });
        }
    }
};
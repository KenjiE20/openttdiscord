// Grab OpenTTD helper
const OpenTTD = require('../openttd');

module.exports = {
    name: 'newserver',
    description: 'Set up a new OpenTTD server for this channel, you can optionally provide a name, server address and port. For security the admin port password must be added via config.',
    usage: '<[name] [address] [port]>',
    guildOnly: true,
    execute(message, args) {
        // Set up a new element in the channel map
        message.client.channelMap.set(message.channel.id, new OpenTTD.Client(args[0], args[1], args[2], null, message.channel));
        // Add element config to the main config
        const map = message.client.channelMap.get(message.channel.id);
        // Make a channelMapping section if it doesn't exist yet
        if (message.client.config.channelMapping === undefined) {
            message.client.config.channelMapping = {};
        }
        const mapConfig = message.client.config.channelMapping[message.channel.id] = {};
        mapConfig.name = map.name;
        mapConfig.address = map.address;
        mapConfig.port = map.port;
        mapConfig.password = map.password;
        mapConfig.autoconnect = map.autoconnect;
        global.logger.info(`New OpenTTD server set up for channel: ${message.channel.id}`);
        message.reply('Config set up, remember to save the config file');
        global.logger.trace(`channelMapping:\n${JSON.stringify(message.client.config.channelMapping, null, 4)}`);
    }
};
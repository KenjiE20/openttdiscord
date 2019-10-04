// Grab OpenTTD helper
const OpenTTD = require('../openttd');

module.exports = {
    name: 'newserver',
    description: 'Set up a new OpenTTD server for this channel, you can optionally provide a name, server address and port. For security the admin port password must be added via config.',
    usage: '<[name] [address] [port]>',
    guildOnly: true,
    perm: 'owner',
    execute(message, args) {
        // Check we're not overwriting existing configs
        const openttd = message.client.channelMap.get(message.channel.id);
        if (openttd) {
            message.reply('This channel already has a config set up');
            return;
        }

        // Make a channelMapping section if it doesn't exist yet
        if (message.client.config.channelMapping === undefined) {
            message.client.config.channelMapping = {};
        }

        // Create config section with args if given
        const mapConfig = message.client.config.channelMapping[message.channel.id] = {};
        if (args) {
            mapConfig.name = args[0];
            mapConfig.address = args[1];
            mapConfig.port = args[2];
        }

        // Set up a new element in the channel map
        message.client.channelMap.set(message.channel.id, new OpenTTD.Client(mapConfig, message.channel));
        // Add element config to the main config
        const map = message.client.channelMap.get(message.channel.id);

        // Copy elements back to config
        mapConfig.name = map.name;
        mapConfig.address = map.address;
        mapConfig.port = map.port;
        mapConfig.password = map.password;
        mapConfig.autoconnect = map.autoconnect;
        mapConfig.public = map.publicAddress;
        global.logger.info(`New OpenTTD server set up for channel: ${message.channel.id}`);
        message.reply('Config set up, remember to save the config file');
        global.logger.trace('channelMapping:', message.client.config.channelMapping);
    }
};
// Grab OpenTTD helper
const OpenTTD = require('../openttd.js');

module.exports = {
    name: 'newserver',
    description: 'Set up a new OpenTTD server for this channel, you can optionally provide a name, server address and port. For security the admin port password must be added via config.',
    usage: '<[name] [address] [port]>',
    execute(message, args) {
        if (message.channel.type !== 'text') {
            return message.reply('This command must be run on a text channel');
        }
        // Set up a new element in the channel map
        message.client.channelMap.set(message.channel.id, new OpenTTD.Client(args[0], args[1], args[2], null, message.channel));
        // Add element config to the main config
        let map = message.client.channelMap.get(message.channel.id);
        let mapconfig = message.client.config.channelMapping[message.channel.id] = {};
        mapconfig.name = map.name;
        mapconfig.address = map.address;
        mapconfig.port = map.port;
        mapconfig.password = map.password;
        global.logger.info(`New OpenTTD server set up for channel:${message.channel.id}`);
        message.reply('Config set up.');
    }
};
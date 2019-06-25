const openttdUtils = require('../openttd/utils');

module.exports = {
    name: 'date',
    description: 'Gives the in game date for the current OpenTTD server\'s password',
    guildOnly: true,
    openttd: true,
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        // Check connection
        if (openttd.isConnected) {
            const DATE = `Current Date: ${openttdUtils.convertOpenttdDate(openttd.gameDate).format('DD MMM YYYY')}`;
            message.reply(`\`${DATE}\``);
        } else {
            message.reply('Not connected');
        }
    }
};
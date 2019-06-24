const moment = require('moment');

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
            const OPENTTD_DATE = moment().year(0).dayOfYear(1);
            OPENTTD_DATE.add(openttd.gameDate, 'days');
            const DATE = `Current Date: ${OPENTTD_DATE.format('DD MMM YYYY')}`;
            message.reply(`\`${DATE}\``);
        } else {
            message.reply('Not connected');
        }
    }
};
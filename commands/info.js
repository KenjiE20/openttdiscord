const openttdUtils = require('../openttd/utils');

module.exports = {
    name: 'info',
    description: 'Get some basic info about the current OpenTTD server\'s game',
    guildOnly: true,
    openttd: true,
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        // Check connection
        if (openttd.isConnected) {
            const NAME = `Name: ${openttd.gameInfo.name}`;
            const VERSION = `Version: ${openttd.gameInfo.version}`;
            let TYPE;
            if (openttd.gameInfo.dedicated) {
                TYPE = 'Type: Dedicated';
            } else {
                TYPE = 'Type: Listen';
            }
            const DATE = `Start Date: ${openttdUtils.convertOpenttdDate(openttd.gameInfo.map.startdate).format('DD MMM YYYY')}`;
            const SIZE = `Size: ${openttd.gameInfo.map.mapheight}x${openttd.gameInfo.map.mapwidth}`;
            /*
            TODO
            const LANDSCAPE = landscape enum convert
            const ADDRESS = public address
            const CURDATE = current date
            */

            const reply = `${NAME} ${VERSION} ${TYPE} ${DATE} ${SIZE}`;
            message.reply(`\`${reply}\``);
        } else {
            message.reply('Not connected');
        }
    }
};
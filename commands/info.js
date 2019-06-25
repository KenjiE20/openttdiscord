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
            const STARTDATE = `Start Date: ${openttdUtils.convertOpenttdDate(openttd.gameInfo.map.startdate).format('DD MMM YYYY')}`;
            const CURDATE = `Current Date: ${openttdUtils.convertOpenttdDate(openttd.gameDate).format('DD MMM YYYY')}`;
            const SIZE = `Size: ${openttd.gameInfo.map.mapheight}x${openttd.gameInfo.map.mapwidth}`;
            const LANDSCAPE = `Landscape: ${openttdUtils.getLandscapeName(openttd.gameInfo.map.landscape)}`;
            /*
            TODO
            const ADDRESS = public address
            */

            const reply = `${NAME} ${VERSION} ${TYPE} ${STARTDATE} ${CURDATE} ${LANDSCAPE} ${SIZE}`;
            message.reply(`\`${reply}\``);
        } else {
            message.reply('Not connected');
        }
    }
};
const moment = require('moment');

module.exports = {
    name: 'ping',
    description: 'Pings the current OpenTTD server',
    guildOnly: true,
    openttd: true,
    alias: ['ding'],
    perm: 'player',
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);
        let pingTime;

        // Check connection
        if (openttd.isConnected) {
            // Event callback
            const pong = function(payload) {
                // Store moment of trigger
                const PONGRETURN = moment();
                global.logger.trace('got pong:', payload);
                // Check if reply has our ping timestamp
                if (payload.int === parseInt(pingTime.format('X'))) {
                    // Cleanup
                    openttd.connection.removeListener('pong', pong);
                    // Calc the difference between reply and send
                    const DIFF = PONGRETURN.diff(pingTime);
                    message.channel.send(`\`Pong: ${DIFF}ms\``);
                }
            };

            // Bind to event
            openttd.connection.on('pong', pong);

            // Store moment of send, and send moment as seconds
            pingTime = moment();
            openttd.connection.send_ping(pingTime.format('X'));
        } else {
            message.reply('Not connected');
        }
    }
};
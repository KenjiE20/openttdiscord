const utils = require('../openttd/utils');

module.exports = {
    name: 'companies',
    description: 'Get company info for the current OpenTTD server\'s game',
    guildOnly: true,
    openttd: true,
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        // Check connection
        if (openttd.isConnected) {
            // If there aren't any companies yet, reply and stop
            if(Object.keys(openttd.companyInfo).length === 0) {
                message.reply('`No companies in game.`');
                return;
            } 

            // Loop through clients and build info
            const companies = [];
            for (const COMPANYID in openttd.companyInfo) {
                const COMPANY = openttd.companyInfo[COMPANYID];
                let text = `Company ${parseInt(COMPANYID)+1}`;
                if (COMPANYID.isai) {
                    text += ' (AI)';
                }
                text += `: ${COMPANY.name} (${utils.getColourName(COMPANY.colour)})`;
                text += `\nManager: ${COMPANY.manager} Started: ${COMPANY.startyear}`;
                text += `\nVehicles: Trains: ${COMPANY.vehicles.trains} Trucks: ${COMPANY.vehicles.lorries} Busses: ${COMPANY.vehicles.busses} Airplanes: ${COMPANY.vehicles.planes} Ships: ${COMPANY.vehicles.ships}`;
                text += `\nStations: Trains: ${COMPANY.stations.trains} Trucks: ${COMPANY.stations.lorries} Busses: ${COMPANY.stations.busses} Airplanes: ${COMPANY.stations.planes} Ships: ${COMPANY.stations.ships}`;
                companies.push(text);
            }

            // Build the reply
            companies.forEach((reply) => {
                message.channel.send(`\`${reply}\``);
            });
        } else {
            message.reply('Not connected');
        }
    }
};
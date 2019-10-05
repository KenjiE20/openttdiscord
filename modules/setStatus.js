const logger = require('./logger');

const setStatus = (discordClient, activityType = 'WATCHING', activeServerAmount) => {
    const newActivityContent = `${activeServerAmount} Servers!`;
    discordClient.user
        .setActivity(newActivityContent, {
            type: activityType
        })
        .then(() => {
            logger.info(`Changed activity to 'Watching ${newActivityContent}'`);
        })
        .catch(reason => {
            logger.error(`Couldn't change bot activity because of the reason: ${reason}`);
        });
};

module.exports = setStatus;

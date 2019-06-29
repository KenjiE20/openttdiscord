const fs = require('fs');
// Import discord.js module
const Discord = require('discord.js');
// Get the openttd handler
const OpenTTD = require('./openttd');
// Grab version from npm package.json
const BOTVERSION = require('./package.json').version;

// Check for config file and stop if not found
try {
    fs.accessSync('./config.json', fs.constants.R_OK);
} catch (error) {
    console.error(`Problem reading config.json: ${error}`);
    return;
}

// Set up logger and make it global for everything to use
const logger = require('./logger.js');
global.logger = logger;

// Init Discord client
const discordClient = new Discord.Client();

// Graceful shutdown function placed into discordClient for access from commands
discordClient.botShutdown = function() {
    // Attempt to disconnect each OpenTTD config
    logger.info('Disconnecting from OpenTTD servers');
    discordClient.channelMap.tap(channelOpenttd => {
        if (channelOpenttd.isConnected) {
            logger.debug(`Disconnecting from OpenTTD Server: ${channelOpenttd.name}`);
            channelOpenttd.disconnect();
        }
    });
    
    // Wait until connection counter clears to disconect discord and end
    const shutdownTimer = setInterval(() => {
        if (!discordClient.openttdConnected.count) {
            logger.info('Shutting down');
            discordClient.destroy();
            clearInterval(shutdownTimer);
        }
    }, 100);
};

// Load config.json into client for ease of access
const configFile = require('./config.json');
discordClient.config = configFile;
logger.info('Config file loaded');
logger.trace(`Config:\n${JSON.stringify(discordClient.config, null, 4)}`);
logger.debug(`Prefix: ${discordClient.config.prefix}`);

logger.info('Loading command files');
// Command collection
discordClient.commands = new Discord.Collection();
// Get command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(f => {
    const command = require(`./commands/${f}`);
    discordClient.commands.set(command.name, command);
    logger.debug(`Loaded ${command.name}`);
});
logger.info(`Loaded ${discordClient.commands.size} commands`);

// Discord client is connected and ready
discordClient.once('ready', () => {
    logger.info(`Connected to Discord as ${discordClient.user.username}`);
    logger.debug(`Active guilds: ${discordClient.guilds.size}`);
    // If we're not in any guilds prompt with invite link
    if (!discordClient.guilds.size) {
        discordClient.generateInvite()
            .then(link => {
                logger.info('Looks like this is the first run of the bot.');
                logger.info('Please use the following link to add this bot to your server:');
                logger.info(link);
            });
    }

    // Object to help keep track of the number of OpenTTD connections active
    discordClient.openttdConnected = {
        counter: 0,
        increment() {
            this.counter++;
            logger.trace(`openttdConnected count: ${this.counter}`);
        },
        decrement() {
            this.counter--;
            logger.trace(`openttdConnected count: ${this.counter}`);
        },
        get count() {
            return this.counter;
        }
    };

    // Mapping for OpenTTD servers to channels
    discordClient.channelMap = new Discord.Collection();
    if (discordClient.config.channelMapping) {
        logger.debug('Has channel mapping in config');
        logger.trace(`channelMapping:\n${JSON.stringify(discordClient.config.channelMapping, null, 4)}`);
        // Load existing configs and copy into handler
        for (const channelID in discordClient.config.channelMapping) {
            if (!discordClient.channels.has(channelID)) {
                logger.warn(`Unable to find Discord channel: ${channelID}`);
            } else {
                const config = discordClient.config.channelMapping[channelID];
                discordClient.channelMap.set(channelID, new OpenTTD.Client(config.name, config.address, config.port, config.password, discordClient.channels.get(channelID), config.autoconnect));
            }
        }
        // Attempt to connect to each OpenTTD config
        discordClient.channelMap.tap(channel => {
            if (channel.autoconnect) {
                channel.connect();
            }
        });
    } else {
        logger.debug('No channel mapping in config');
    }
});

// Got a discord message
discordClient.on('message', message => {
    // Handle chat if it isn't another bot and isn't a command
    if (!message.author.bot && !message.content.startsWith(discordClient.config.prefix)) {
        // Check channel has an OpenTTD connection and send chat if it does
        const openttd = discordClient.channelMap.get(message.channel.id);
        if (openttd && openttd.isConnected) {
            openttd.sendChat(message);
        }
    }

    // Check if message has command prefix, and isn't another bot
    if (!message.content.startsWith(discordClient.config.prefix) || message.author.bot) return;

    // Split message into command and arguments
    const args = message.content.slice(discordClient.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    logger.debug(`Command Name: ${commandName}, args: ${args}`);

    // Check command is in cached command list
    const command = discordClient.commands.get(commandName) || discordClient.commands.find(c => c.alias && c.alias.includes(commandName));
    if (!command) {
        logger.debug(`Invalid command: ${commandName}`);
        return;
    }

    // Check for arguement requirements
    if (command.args && !args.length) {
        let reply = 'Missing arguments for command';
        if (command.usage) {
            reply += `\nProper usage: ${discordClient.config.prefix}${commandName} ${command.usage}`;
        }
        message.reply(reply);
        return;
    }

    // Check for channel requirements
    if (command.guildOnly && message.channel.type !== 'text') {
        message.reply('This command must be run on a channel');
        return;
    }

    // Check for OpenTTD requirement
    if (command.openttd && !discordClient.channelMap.get(message.channel.id)) {
        message.reply('This command requires an OpenTTD server set up for this channel');
        return;
    }

    // Attempt to execute command
    logger.debug(`Attemping command: ${command.name} (${commandName})`);
    try {
        command.execute(message, args);
    } catch (error) {
        logger.error(`Error when executing ${commandName}: ${error}`);
        message.reply('Something went wrong');
    }
});

// Other Discord events
discordClient.on('error', error => {
    logger.error(`Got a discord error: ${error}`);
});

discordClient.on('reconnecting', () => {
    logger.info('Reconnecting to discord');
});

/*
discordClient.on('disconnect', close => {
    logger.debug(`code: ${close.code}\nreason: ${close.reason}\nclean: ${close.clean}`);
});
*/

logger.info(`OpenTTDiscord bot v${BOTVERSION}`);
logger.info('Connecting to Discord');
// Log in to discord
discordClient.login(discordClient.config.token)
    .catch(error => {
        logger.error(`An error occurred connecting to Discord; ${error}`);
    });

// Catch SIGINT and shutdown gracefully
// No need for process.exit as shutting down the connections should end the event loop
process.on('SIGINT', () => {
    discordClient.botShutdown();
});
// Catch shutdown message (windows) and shutdown gracefully
process.on('message', msg => {
    if (msg === 'shutdown') {
        discordClient.botShutdown();
    }
});
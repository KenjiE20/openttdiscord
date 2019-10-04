const fs = require('fs');
// Import discord.js module
const Discord = require('discord.js');
// Get the openttd handler
const OpenTTD = require('./openttd');
// Grab version from npm package.json
const BOTVERSION = require('./package.json').version;
// Set up logger and make it global for everything to use
const logger = require('./modules/logger');
global.logger = logger;
// Config module
const config = require('./modules/config');
// Permissions module
const perm = require('./modules/permissions');

// Init Discord client
const discordClient = new Discord.Client();

// Load config into client for ease of access
discordClient.config = config.load();
// Set logging level
logger.setLevel(discordClient.config.loglevel);

// Start up logging
logger.info('Config file loaded');
logger.debug(`Prefix: ${discordClient.config.prefix}`);
logger.trace('Config:', discordClient.config);
// Owner ID check
if (discordClient.config.roles.ownerID.length === 0) logger.warn('No ownerID set');

// Config save action for commands to use
discordClient.saveBotConfig = config.save;

// Set up permissions
perm.setRoles(discordClient.config.roles);

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
            process.exit(0);
        }
    }, 100);
};

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

// Collection to hold coldown tracking for commands
const cooldowns = new Discord.Collection();

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
        logger.trace('channelMapping:', discordClient.config.channelMapping);
        // Load existing configs and copy into handler
        for (const channelID in discordClient.config.channelMapping) {
            if (!discordClient.channels.has(channelID)) {
                logger.warn(`Unable to find Discord channel: ${channelID}`);
            } else {
                const config = discordClient.config.channelMapping[channelID];
                discordClient.channelMap.set(channelID, new OpenTTD.Client(config, discordClient.channels.get(channelID)));
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
    // Bot check
    if (message.author.bot) return;

    // Handle chat if it isn't a command
    if (!message.content.startsWith(discordClient.config.prefix)) {
        // Check channel has an OpenTTD connection and send chat if it does
        const openttd = discordClient.channelMap.get(message.channel.id);
        if (openttd && openttd.isConnected) {
            openttd.sendChat(message);
        }
        return;
    }

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

    // Check permissions
    if (!perm.hasPerm(message, command.perm)) {
        message.reply('You do not have permissions for this command');
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

    // Check for cooldowns
    if (!cooldowns.has(command.name)) {
        // No cooldown for this command yet, so set up
        cooldowns.set(command.name, new Discord.Collection());
    }
    // Current timestamp
    const now = Date.now();
    // Collection for the triggered command
    const timestamps = cooldowns.get(command.name);
    // Get cooldown for this command
    const cooldownAmount = (command.cooldown || discordClient.config.cooldown) * 1000;
    
    // If the author has a cooldown
    if (timestamps.has(message.author.id)) {
        // Calculate the cooldown expiry
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        // Check for expiry
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${command.name}\``);
            return;
        }
    }

    // Cooldown check cleared, add user to the timestamps
    timestamps.set(message.author.id, now);
    // Delete user after the cooldown passes
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

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

logger.info(`OpenTTDiscord bot v${BOTVERSION}`);
logger.info('Connecting to Discord');

// Log in to discord
discordClient.login(discordClient.config.token)
    .catch(error => {
        logger.error(`An error occurred connecting to Discord; ${error}`);
    });

// Catch SIGINT and shutdown gracefully
process.on('SIGINT', () => {
    discordClient.botShutdown();
});
// Catch shutdown message (windows) and shutdown gracefully
process.on('message', msg => {
    if (msg === 'shutdown') {
        discordClient.botShutdown();
    }
});
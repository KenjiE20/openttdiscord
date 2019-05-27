const fs = require('fs');
// Import discord.js module
const Discord = require('discord.js');
// Grab version from npm package.json
const botversion = require('./package.json').version;

// Check for config file and stop if not found
try {
    fs.accessSync('./config.json', fs.constants.R_OK);
}
catch (error) {
    console.error(`Problem reading config.json: ${error}`);
    return;
}

// Set up logger and make it global for everything to use
const logger = require('./logger.js');
global.logger = logger;

// Init Discord client
const client = new Discord.Client();

// Load config.json into client for ease of access
const configFile = require('./config.json');
client.config = configFile;
logger.debug('Config file loaded');
logger.debug(`Prefix: ${client.config.prefix}`);
logger.debug(`Token: ${client.config.token}`);

logger.info('Loading command files');
// Command collection
client.commands = new Discord.Collection();
// Get command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(f => {
    const command = require(`./commands/${f}`);
    client.commands.set(command.name, command);
    logger.debug(`Loaded ${command.name}`);
});
logger.info(`Loaded ${client.commands.size} commands`)

// Mapping for OpenTTD servers to channels
client.channelMap = new Discord.Collection();

// Discord client is connected and ready
client.once('ready', () => {
    logger.info(`Connected to Discord as ${client.user.username}`);
    logger.debug(`Active guilds: ${client.guilds.size}`);
    if (!client.guilds.size) {
        logger.debug(`clientid: ${client.user.id}`);
        logger.info('Looks like this is the first run of the bot.');
        logger.info('Please use the following link to add this bot to your server:');
        logger.info(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot`);
    }
});

// Got a discord message
client.on('message', message => {
    // Check if message has command prefix, and isn't another bot
    if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

    // Split message into command and arguments
    const args = message.content.slice(client.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    logger.debug(`Command Name: ${commandName}, args: ${args}`);

    const command = client.commands.get(commandName) || client.commands.find(c => c.alias && c.alias.includes(commandName));

    // Check command is in cached command list
    if (!command) {
        logger.debug(`Invalid command: ${commandName}`);
        return;
    }

    // Check for arguement requirements
    if (command.args && !args.length) {
        let reply = 'Missing arguments for command';
        if (command.usage) {
            reply += `\nProper usage: ${client.config.prefix}${commandName} ${command.usage}`;
        }
        message.reply(reply);
        return;
    }

    // Check for channel requirements
    if (command.guildOnly && message.channel.type !== 'text') {
        message.reply('This command must be run on a channel');
        return;
    }

    // Attempt to execute command
    logger.debug(`Attemping command: ${command.name} (${commandName})`);
    try {
        command.execute(message, args);
    }
    catch (error) {
        logger.error(`Error when executing ${commandName}: ${error}`);
        message.reply('Something went wrong');
    }
});

client.on('error', error => {
    logger.error(`Got a discord error: ${error}`);
});

client.on('reconnecting', () => {
    logger.info(`Reconnecting to discord`);
});

/*
client.on('disconnect', close => {
    logger.debug(`code: ${close.code}\nreason: ${close.reason}\nclean: ${close.clean}`);
});
*/

logger.info(`OpenTTDiscord bot v${botversion}`);
logger.info('Connecting to Discord');
// Log in to discord
//client.login(client.config.token);
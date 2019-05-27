module.exports = {
    name: 'help',
    description: 'Provides a list of commands, or help for a command',
    usage: '[<command>]',
    alias: ['commands'],
    execute(message, args) {
        let reply;
        // If command was called without arguments give command list
        if (!args.length) {
            global.logger.debug('Give command list');
            reply = `Command list: ${message.client.commands.map(c => c.name).join(', ')}`;
        }
        // Give command help
        else {
            const command = message.client.commands.get(args[0].toLowerCase());
            reply = `${message.client.config.prefix}${command.name}`;
            if(command.usage) reply += ` ${command.usage}`;
            if(command.description) reply += `\n${command.description}`;
            if(command.alias) reply += `\nAliases: ${command.alias.join(', ')}`;
        }
        message.reply(reply);
    }
}
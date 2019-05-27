module.exports = {
    name: 'id',
    description: 'Returns the users id, or the channel id',
    usage: '[channel]',
    execute(message, args) {
        if (args[0] === 'channel') {
            message.reply(`Channel id for ${message.channel.name}: ${message.channel.id}`);
        }
        else {
            message.reply(`Your id is: ${message.author.id}`);
        }
    }
};
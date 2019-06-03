// Bring in admin port library
var openttdAdmin = require('node-openttd-admin');

// Handler class
class Client {
    constructor(name, address, port, password, channel) {
        // Defaults for new objects
        this.name = name || 'OpenTTD Server';
        this.address = address || 'localhost';
        this.port = port || 3977;
        this.password = password || 'password';
        // Discord channel map
        this.channel = channel || '';
        this.connection = new openttdAdmin.connection();

        // Info cache
        this.gameInfo;
        this.clientInfo = {};
        this.companyInfo = {};

        // Handle admin port events
        this.connection.on('connect', () => {
            this.connection.authenticate('OpenTTDiscord', this.password);
        });
        this.connection.on('error', error => {
            global.logger.error(`Error occurred on OpenTTD connection: ${this.name}`);
        });
        this.connection.on('welcome', data => {
            global.logger.info(`Connected to OpenTTD server: ${this.name}`);
            // Cache info
            this.gameInfo = data;
            // Request updates
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, 0xFFFFFFFF);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CHAT, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
        });
        this.connection.on('clientinfo', client => {
            // Cache client info
            this.clientInfo[client.id] = {'ip': client.ip, 'name': client.name, 'lang': client.lang, 'joindate': client.joindate, 'company': client.company};
            global.logger.trace(`clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });
        this.connection.on('clientupdate', client => {
            if (this.clientInfo[client.id].name !== client.name) {
                channel.send(`${this.clientInfo[client.id].name} has changed their name to ${client.name}`);
            }
            else if (this.clientInfo[client.id].company !== client.company) {
                channel.send(`${this.clientInfo[client.id].name} has joined ${client.company}`);
            }
            // Update cached client info
            this.clientInfo[client.id].name = client.name;
            this.clientInfo[client.id].company = client.company;
            global.logger.trace(`clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });
        this.connection.on('clientjoin', id => {
            if (this.clientInfo[id].name) {
                channel.send(`${this.clientInfo[id].name} has joined`);
            }
            else {
                channel.send(`Client ${id} has joined`);
            }
        });
        this.connection.on('chat', chat => {
            global.logger.trace(`chat;\n${JSON.stringify(chat,null,4)}`);
            channel.send(`<${this.clientInfo[chat.id].name}> ${chat.message}`);
        })
    }

    // Function to connect to OpenTTD
    connect() {
        this.connection.connect(this.address, this.port);
    };
    sendChat(message) {
        this.connection.send_chat(openttdAdmin.enums.Actions.CHAT, openttdAdmin.enums.DestTypes.BROADCAST, 1, `<${message.author.username}> ${message.content}`);
    }
}

exports.Client = Client;
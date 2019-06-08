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
            global.logger.trace(`gameinfo;\n${JSON.stringify(this.gameInfo, null, 4)}`);
            // Request updates
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, 0xFFFFFFFF);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CHAT, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
        });

        // Client Events
        this.connection.on('clientinfo', client => {
            // Cache client info
            this.clientInfo[client.id] = {'ip': client.ip, 'name': client.name, 'lang': client.lang, 'joindate': client.joindate, 'company': client.company};
            global.logger.trace(`clientinfo: clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });
        this.connection.on('clientupdate', client => {
            // Send changed info to Discord
            if (this.clientInfo[client.id].name !== client.name) {
                channel.send(`${this.clientInfo[client.id].name} has changed their name to ${client.name}`);
            }
            else if (this.clientInfo[client.id].company !== client.company) {
                channel.send(`${this.clientInfo[client.id].name} has joined ${client.company}`);
            }
            // Update cached client info
            this.clientInfo[client.id].name = client.name;
            this.clientInfo[client.id].company = client.company;
            global.logger.trace(`clientupdate: clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });
        this.connection.on('clientjoin', id => {
            // Name check in case events happened out of order
            if (this.clientInfo[id].name) {
                channel.send(`${this.clientInfo[id].name} has joined`);
            }
            else {
                channel.send(`Client ${id} has joined`);
            }
        });
        this.connection.on('clienterror', client => {
            global.logger.trace(`OpenTTD client error: id; ${client.id}, error; ${client.error}`);
            // Only handle clienterror when it provides an error, as this event fires while clients join and leave
            if (client.error) {
                channel.send(`${this.clientInfo[client.id].name} got an error; ${client.error}`);
                delete this.clientInfo[client.id];
                global.logger.trace(`clienterror: clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
            }
        });
        this.connection.on('clientquit', client => {
            channel.send(`${this.clientInfo[client.id].name} quit`);
            delete this.clientInfo[client.id];
            global.logger.trace(`clientquit: clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });

        // Handle chat
        this.connection.on('chat', chat => {
            global.logger.trace(`chat;\n${JSON.stringify(chat,null,4)}`);
            channel.send(`<${this.clientInfo[chat.id].name}> ${chat.message}`);
        })
    }

    // Function to connect to OpenTTD
    connect() {
        this.connection.connect(this.address, this.port);
    };
    // Chat function
    sendChat(message) {
        this.connection.send_chat(openttdAdmin.enums.Actions.CHAT, openttdAdmin.enums.DestTypes.BROADCAST, 1, `<${message.author.username}> ${message.content}`);
    }
    // Function to clean up
    disconnect() {
        this.connection.close();
    }
}

exports.Client = Client;
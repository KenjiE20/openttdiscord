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
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.COMPANY_INFO, 0xFFFFFFFF);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.COMPANY_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
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

        // Company Events
        // companyinfo and companyupdate both hold shared and unique elements
        // so in order to cache, these have to be mapped individually
        this.connection.on('companyinfo', company => {
            // Create properties if this is a new company
            if (!this.companyInfo[company.id]) {
                this.companyInfo[company.id] = {'name': '', manager: '', colour: 0, protected: 0, startyear: 0, isai: 0, bankruptcy: 0, shares: {'1': 255, '2': 255,'3': 255,'4': 255}};
            }
            this.companyInfo[company.id].name = company.name;
            this.companyInfo[company.id].manager = company.manager;
            this.companyInfo[company.id].colour = company.colour;
            this.companyInfo[company.id].protected = company.protected;
            this.companyInfo[company.id].startyear = company.startyear;
            this.companyInfo[company.id].isai = company.isai;
            global.logger.trace(`companyinfo: companyinfo is now;\n${JSON.stringify(this.companyInfo, null, 4)}`);
        });
        this.connection.on('companyupdate', company => {
            this.companyInfo[company.id].name = company.name;
            this.companyInfo[company.id].manager = company.manager;
            this.companyInfo[company.id].colour = company.colour;
            this.companyInfo[company.id].protected = company.protected;
            this.companyInfo[company.id].bankruptcy = company.bankruptcy;
            this.companyInfo[company.id].shares = company.shares;
            global.logger.trace(`companyupdate: companyinfo is now;\n${JSON.stringify(this.companyInfo, null, 4)}`);
        });
        this.connection.on('companyremove', company => {
            let remove = `Company #${company.id+1} (${this.companyInfo[company.id].name}) was removed`;
            switch(company.reason) {
                case openttdAdmin.enums.CompanyRemoveReasons.MANUAL: remove += ' manually'; break;
                case openttdAdmin.enums.CompanyRemoveReasons.AUTOCLEAN: remove += ' by autoclean'; break;
                case openttdAdmin.enums.CompanyRemoveReasons.BANKRUPT: remove += ' after going bankrupt'; break;
            }
            channel.send(remove);
            delete this.companyInfo[company.id];
            global.logger.trace(`companyremove: companyinfo is now;\n${JSON.stringify(this.companyInfo, null, 4)}`);
        });

        // Handle chat
        this.connection.on('chat', chat => {
            global.logger.trace(`chat;\n${JSON.stringify(chat,null,4)}`);
            // Only pass broadcast chats
            if (chat.action === openttdAdmin.enums.Actions.CHAT && chat.desttype === openttdAdmin.enums.DestTypes.BROADCAST) {
                channel.send(`<${this.clientInfo[chat.id].name}> ${chat.message}`);
            }
            // New company event is better handled here than via admin port event
            if (chat.action === openttdAdmin.enums.Actions.COMPANY_NEW) {
                channel.send(`${this.clientInfo[chat.id].name} has started a new company #${this.clientInfo[chat.id].company+1}`);
            }
            // Player joins a company
            if (chat.action === openttdAdmin.enums.Actions.COMPANY_JOIN) {
                const clientname = this.clientInfo[chat.id].name;
                const companyid = this.clientInfo[chat.id].company;
                const companyname = this.companyInfo[companyid].name;
                channel.send(`${clientname} has joined Company #${companyid+1} (${companyname})`);
            }
            // Player joins spectators
            if (chat.action === openttdAdmin.enums.Actions.COMPANY_SPECTATOR) {
                channel.send(`${this.clientInfo[chat.id].name} is now spectating`);
            }
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
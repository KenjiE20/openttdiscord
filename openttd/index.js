// Bring in admin port library
const openttdAdmin = require('node-openttd-admin');
const openttdUtils = require('./utils');

// Handler class
class Client {
    constructor(config, channel) {
        // Defaults for new objects
        this.name = config.name || 'OpenTTD Server';
        this.address = config.address || 'localhost';
        this.port = config.port || 3977;
        this.password = config.password || 'password';
        this.autoconnect = config.autoconnect || false;
        this.publicAddress = config.public ||  'N/A';
        this.isLocal = config.local || false;
        this.savepath = config.savepath ||  '';
        
        // Discord channel map
        this.channel = channel || '';
        
        this.connection = new openttdAdmin.connection();

        // Helper properties
        this.isConnected = false;

        // Info cache
        this.gameInfo;
        this.clientInfo = {};
        this.companyInfo = {};
        this.gameDate = 0;

        // rcon state
        this.rconQueue = []; // Command queue
        this.RCONSTATE = 'IDLE'; // Current state
        this.RCONCMD = ''; // Last used command

        // Handle admin port events
        this.connection.on('connect', () => {
            this.connection.authenticate('OpenTTDiscord', this.password);
        });
        this.connection.on('error', error => {
            if (error === 'connectionerror') {
                channel.send(`\`An Error occurred with OpenTTD Server: ${this.name}\``);
                global.logger.error(`Error occurred on OpenTTD connection: ${this.name}\n${error}`);
            } else if (error === 'connectionclose') {
                channel.send(`\`Disconnected from OpenTTD Server: ${this.name}\``);
                global.logger.info(`OpenTTD connection closed: ${this.name}`);
                this.connection = new openttdAdmin.connection();
            }
            if (this.isConnected) {
                this.isConnected = false;
                channel.client.openttdConnected.decrement();
            }
        });
        this.connection.on('welcome', data => {
            // Reset info cache
            this.gameInfo;
            this.clientInfo = {};
            this.companyInfo = {};
            this.gameDate = 0;
            
            // Only toggle and increment if new connection, not when a new game happens
            if (!this.isConnected) {
                this.isConnected = true;
                channel.client.openttdConnected.increment();
            }
            global.logger.info(`Connected to OpenTTD Server: ${this.name}`);
            channel.send(`\`Connected to OpenTTD Server: ${this.name}\``);
            // Cache info
            this.gameInfo = data;
            global.logger.trace('gameinfo;', this.gameInfo);
            // Request updates
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, 0xFFFFFFFF);
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.COMPANY_INFO, 0xFFFFFFFF);
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.DATE);
            this.connection.send_poll(openttdAdmin.enums.UpdateTypes.COMPANY_STATS);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CONSOLE, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.COMPANY_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CHAT, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.DATE, openttdAdmin.enums.UpdateFrequencies.DAILY);
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.COMPANY_STATS, openttdAdmin.enums.UpdateFrequencies.WEEKLY);
        });
        this.connection.on('newgame', () => {
            global.logger.trace('newgame; resetting caches');
            channel.send('`New game starting, please stand by`');
            // Reset info cache
            this.gameInfo;
            this.clientInfo = {};
            this.companyInfo = {};
            this.gameDate = 0;
        });
        this.connection.on('console', openttdConsole => {
            global.logger.trace('console;', openttdConsole);
            // Output contains a direction unicode marker, so strip this for tests
            const MESSAGE = openttdConsole.output.substring(1);
            // Pause messages
            if (MESSAGE.startsWith('***') && MESSAGE.includes('pause')) {
                channel.send(`\`${openttdConsole.output}\``);
            }
        });

        // Client Events
        this.connection.on('clientinfo', client => {
            // Cache client info
            this.clientInfo[client.id] = {'ip': client.ip, 'name': client.name, 'lang': client.lang, 'joindate': client.joindate, 'company': client.company};
            global.logger.trace('clientinfo: clientinfo is now;', this.clientInfo);
        });
        this.connection.on('clientupdate', client => {
            // Send changed info to Discord
            if (this.clientInfo[client.id].name !== client.name) {
                channel.send(`\`${this.clientInfo[client.id].name} has changed their name to ${client.name}\``);
            }
            // Update cached client info
            this.clientInfo[client.id].name = client.name;
            this.clientInfo[client.id].company = client.company;
            global.logger.trace('clientupdate: clientinfo is now;', this.clientInfo);
        });
        this.connection.on('clientjoin', id => {
            global.logger.trace(`clientjoin: id; ${id}`);
            // Name check in case events happened out of order
            if (this.clientInfo[id].name) {
                let join = `${this.clientInfo[id].name} has connected`;
                if (this.clientInfo[id].company === 255) {
                    join += ' (Spectator)';
                } else {
                    // Test if company exists
                    if (this.companyInfo[this.clientInfo[id].company]) {
                        join += ` in Company #${this.clientInfo[id].company+1} (${this.companyInfo[this.clientInfo[id].company].name})`;
                    }
                }
                channel.send(`\`${join}\``);
            } else {
                channel.send(`\`Client ${id} has joined\``);
            }
        });
        this.connection.on('clienterror', client => {
            global.logger.trace(`OpenTTD client error: id; ${client.id}, error; ${client.err} (${openttdUtils.getNetworkErrorCode(client.err)})`);
            // Only handle clienterror when it provides an error and client was fully connected/cached, as this event fires while clients join and leave
            if (client.err && this.clientInfo[client.id]) {
                channel.send(`\`${this.clientInfo[client.id].name} got an error; ${openttdUtils.getNetworkErrorCode(client.err)}\``);
                delete this.clientInfo[client.id];
                global.logger.trace('clienterror: clientinfo is now;', this.clientInfo);
            }
        });
        this.connection.on('clientquit', client => {
            channel.send(`\`${this.clientInfo[client.id].name} quit\``);
            delete this.clientInfo[client.id];
            global.logger.trace('clientquit: clientinfo is now;', this.clientInfo);
        });

        /*
         * Company Events
         * companyinfo and companyupdate both hold shared and unique elements
         * so in order to cache, these have to be mapped individually
         */
        this.connection.on('companyinfo', company => {
            // Create properties if this is a new company
            if (!this.companyInfo[company.id]) {
                this.companyInfo[company.id] = {
                    'name': '',
                    'manager': '',
                    'colour': 0,
                    'protected': 0,
                    'startyear': 0,
                    'isai': 0,
                    'bankruptcy': 0,
                    'shares': {
                        '1': 255,
                        '2': 255,
                        '3': 255,
                        '4': 255
                    },
                    'vehicles': {
                        trains: 0,
                        lorries: 0,
                        busses: 0,
                        planes: 0,
                        ships: 0
                    },
                    'stations': {
                        trains: 0,
                        lorries: 0,
                        busses: 0,
                        planes: 0,
                        ships: 0
                    }
                };
            }
            this.companyInfo[company.id].name = company.name;
            this.companyInfo[company.id].manager = company.manager;
            this.companyInfo[company.id].colour = company.colour;
            this.companyInfo[company.id].protected = company.protected;
            this.companyInfo[company.id].startyear = company.startyear;
            this.companyInfo[company.id].isai = company.isai;
            global.logger.trace('companyinfo: companyinfo is now;', this.companyInfo);
        });
        this.connection.on('companyupdate', company => {
            this.companyInfo[company.id].name = company.name;
            this.companyInfo[company.id].manager = company.manager;
            this.companyInfo[company.id].colour = company.colour;
            this.companyInfo[company.id].protected = company.protected;
            this.companyInfo[company.id].bankruptcy = company.bankruptcy;
            this.companyInfo[company.id].shares = company.shares;
            global.logger.trace('companyupdate: companyinfo is now;', this.companyInfo);
        });
        this.connection.on('companyremove', company => {
            let remove = `Company #${company.id+1} (${this.companyInfo[company.id].name}) was removed`;
            switch(company.reason) {
                case openttdAdmin.enums.CompanyRemoveReasons.MANUAL: remove += ' manually'; break;
                case openttdAdmin.enums.CompanyRemoveReasons.AUTOCLEAN: remove += ' by autoclean'; break;
                case openttdAdmin.enums.CompanyRemoveReasons.BANKRUPT: remove += ' after going bankrupt'; break;
            }
            channel.send(`\`${remove}\``);
            delete this.companyInfo[company.id];
            global.logger.trace('companyremove: companyinfo is now;', this.companyInfo);
        });
        this.connection.on('companystats', company => {
            this.companyInfo[company.id].vehicles = company.vehicles;
            this.companyInfo[company.id].stations = company.stations;
            global.logger.trace('companystats: companyInfo is now;', this.companyInfo);
        });

        // Date handler
        this.connection.on('date', date => {
            this.gameDate = date;
            global.logger.trace('date: gameDate is now;', this.gameDate);
        });

        // Handle chat
        this.connection.on('chat', chat => {
            global.logger.trace('chat;', chat);
            // Only pass broadcast chats
            if (chat.action === openttdAdmin.enums.Actions.CHAT && chat.desttype === openttdAdmin.enums.DestTypes.BROADCAST) {
                // Convert standard smilies and emojis
                let msg = openttdUtils.emojify(chat.message);

                // Look for discord custom emoji and convert
                channel.client.emojis.cache.each(em => {
                    msg = msg.replace(`:${em.name}:`, `<:${em.identifier}>`);
                });

                channel.send(`<${this.clientInfo[chat.id].name}> ${msg}`);
            }
            // New company event is better handled here than via admin port event
            if (chat.action === openttdAdmin.enums.Actions.COMPANY_NEW) {
                channel.send(`\`${this.clientInfo[chat.id].name} has started a new Company #${this.clientInfo[chat.id].company+1}\``);
            }
            // Player joins a company
            if (chat.action === openttdAdmin.enums.Actions.COMPANY_JOIN) {
                const clientname = this.clientInfo[chat.id].name;
                const companyid = this.clientInfo[chat.id].company;
                const companyname = this.companyInfo[companyid].name;
                channel.send(`\`${clientname} has joined Company #${companyid+1} (${companyname})\``);
            }
            // Player joins spectators
            if (chat.action === openttdAdmin.enums.Actions.COMPANY_SPECTATOR) {
                channel.send(`\`${this.clientInfo[chat.id].name} is now spectating\``);
            }
        });
        
        // Catch any rconend for queue processing
        this.connection.on('rconend', rconend => {
            global.logger.trace('Got rconend:', rconend);
            // Sanity check rencend is the last used command
            if (rconend.command === this.RCONCMD) {
                // Reset state and try for queued command
                this.RCONCMD = '';
                this.RCONSTATE = 'IDLE';
                this.tryRcon();
            }
        });

        // Process queue
        this.tryRcon = function() {
            // Only action if rcon is idle
            global.logger.trace('rcon state:', this.RCONSTATE);
            if (this.RCONSTATE === 'IDLE') {
                // Do we have queued commands
                global.logger.trace('rcon Queue:', this.rconQueue);
                if (this.rconQueue.length) {
                    // Set state and send the first command in queue
                    this.RCONSTATE = 'ACTIVE';
                    this.RCONCMD = this.rconQueue.shift();
                    global.logger.trace('sending rcon:', this.RCONCMD);
                    this.connection.send_rcon(this.RCONCMD);
                }
            }
        };
    }
}

// Add rcon to queue and trigger process
Client.prototype.sendRcon = function(rconcmd) {
    global.logger.trace('adding rcon:', rconcmd);
    this.rconQueue.push(rconcmd);
    this.tryRcon();
};

// Function to connect to OpenTTD
Client.prototype.connect = function() {
    return this.connection.connect(this.address, this.port);
};

// Chat function
Client.prototype.sendChat = function(message) {
    const name = message.member.nickname || message.author.username; // Prefer nickname over username if set

    // Clean up unicode emojis to text
    let msg = openttdUtils.emoji.unemojify(message.cleanContent);

    // Find any custom discord emoji and convert
    message.client.emojis.cache.each(em => {
        msg = msg.replace(`<:${em.identifier}>`, `:${em.name}:`);
    });
    
    this.connection.send_chat(openttdAdmin.enums.Actions.CHAT, openttdAdmin.enums.DestTypes.BROADCAST, 1, `<${name}> ${msg}`);
};

// Function to clean up
Client.prototype.disconnect = function() {
    this.connection.close();
    this.connection = new openttdAdmin.connection();
};

exports.Client = Client;
// Bring in admin port library
var openttdAdmin = require('node-openttd-admin');

// Handler class
class Client {
    constructor(name, address, port, password, channelID) {
        // Defaults for new objects
        this.name = name || 'OpenTTD Server';
        this.address = address || 'localhost';
        this.port = port || 3977;
        this.password = password || 'password';
        // Discord channel map
        this.channelID = channelID || '';
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
            this.connection.send_update_frequency(openttdAdmin.enums.UpdateTypes.CLIENT_INFO, openttdAdmin.enums.UpdateFrequencies.AUTOMATIC);
        });
        this.connection.on('clientinfo', client => {
            // Cache client info
            this.clientInfo[client.id] = {'ip': client.ip, 'name': client.name, 'lang': client.lang, 'joindate': client.joindate, 'company': client.company};
            global.logger.debug(`clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });
        this.connection.on('clientupdate', client => {
            // Update cached client info
            this.clientInfo[client.id].name = client.name;
            this.clientInfo[client.id].company = client.company;
            global.logger.debug(`clientinfo is now;\n${JSON.stringify(this.clientInfo,null,4)}`);
        });
    }

    // Function to connect to OpenTTD
    connect() {
        this.connection.connect(this.address, this.port);
    };
}

exports.Client = Client;
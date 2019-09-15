const fs = require('fs');
const yaml = require('js-yaml');

const configFile = 'config/config.yml';

// Load YAML config file and returns
exports.load = () => {
    try {
        const config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

        // Set defaults if not in config
        if (!config.prefix) config.prefix = '!';
        if (!config.loglevel) config.prefix = 'info';
        // Make sure some values at least exist
        if (!config.roles.ownerID) config.roles.ownerID = [];
        if (!config.roles.admin) config.roles.admin = [];
        if (!config.roles.mod) config.roles.mod = [];
        if (!config.roles.player) config.roles.player = [];

        return config;
    } catch (e) {
        console.log(e);
    }
};

// Saves the config back to YAML config file, returns success state
exports.save = (config) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(configFile, yaml.safeDump(config), (error) => {
            if (error) {
                return reject (error);
            } else {
                resolve('OK');
            }
        });
    });
};
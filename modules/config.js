const fs = require('fs');
const yaml = require('js-yaml');

const configFile = 'config/config.yml';

// Load YAML config file and returns
exports.load = () => {
    try {
        const config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

        // Set defaults if not in config
        if (config.prefix === null) config.prefix = '!';
        if (config.loglevel === null) config.prefix = 'info';

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
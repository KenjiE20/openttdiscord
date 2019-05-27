// Get our requirements
const moment = require('moment');
const levels = {
    "debug": 0,
    "info": 1,
    "warn": 2,
    "error": 3
};

// Get logging level from config, or fallback to default
const loggingLevel = require('./config.json').loglevel || 'info';

// Master logging function
exports.log = (content, type = 'info') => {
    // Get current date & time
    const time = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
    // Output based on log level
    const msgLevel = levels[type.toLowerCase()];
    if (msgLevel >= levels[loggingLevel.toLowerCase()]) {
        console.log(`${time} ${type.toUpperCase().padStart(5,' ')} ${content}`);
    }
    return;
};

// Aliases to log at logging levels
exports.error = (args) => this.log(args, 'error');
exports.warn = (args) => this.log(args, 'warn');
exports.info = (args) => this.log(args, 'info');
exports.debug = (args) => this.log(args, 'debug');
/*
 *Helper functions for working with OpenTTD data
 */
const moment = require('moment');
const enums = require('./enums');
const emoji = require('node-emoji');

// Convert from OpenTTD date int to moment() object
const convertOpenttdDate = function(openttdDate) {
    // OpenTTD dates start at 1 Jan 0000
    const OPENTTD_DATE = moment().year(0).dayOfYear(1);
    OPENTTD_DATE.add(openttdDate, 'days');
    return OPENTTD_DATE;
};

// Retrieve OpenTTD colour name from table
const getColourName = function(colour) {
    return enums.ColourNames[colour];
};

// Return text version of landscape
const getLandscapeName = function(landscape) {
    switch (landscape) {
        case enums.Landscape.TEMPERATE: return 'Temperate';
        case enums.Landscape.ARCTIC: return 'Sub-arctic';
        case enums.Landscape.TROPIC: return 'Sub-tropical';
        case enums.Landscape.TOYLAND: return 'Toyland';
    }
};

// Return readable string version of NetworkErrorCodes
const getNetworkErrorCode = function(code) {
    return enums.NetworkErrorCode[code];
};

// Convertion map for some common smilies to emojis
const smilemap = {
    ':d': ':grin:',
    ':D': ':grin:',
    ':)': ':slight_smile:',
    ';)': ':wink:',
    '-_-': ':expressionless:',
    ':|': ':neutral_face:',
    ':/': ':confused:',
    ':p': ':stuck_out_tongue:',
    ':P': ':stuck_out_tongue:',
    ':\'(': ':cry:',
    ';\'(': ':sob:',
    ':(': ':frowning:',
    '>:(': ':angry:',
    ':@': ':rage:',
    ':o': ':open_mouth:',
    ':O': ':open_mouth:',
    '<3': ':heart:',
    '</3': ':broken_heart:'
};

// Parse OpenTTD line for emojis
const emojify = function(text) {
    // node-emoji-fy known unicodes
    text = emoji.emojify(text);

    // Split string and loop to find and replace common smilies
    const words = text.split(' ');
    words.forEach(($word, $index) => {
        if($word in smilemap) {
            words[$index] = smilemap[$word];
        }
    });
    text = words.join(' ');
    
    return text;
};

module.exports = {
    convertOpenttdDate,
    getColourName,
    getLandscapeName,
    getNetworkErrorCode,
    emoji,
    emojify
};
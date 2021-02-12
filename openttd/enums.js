/* OpenTTD enums and helpers */

// Sourced from https://wiki.openttd.org/OpenTTDDevBlackBook/Window/Colours
const ColourNames = {
    0: 'Dark Blue',
    1: 'Pale Green',
    2: 'Pink',
    3: 'Yellow',
    4: 'Red',
    5: 'Light Blue',
    6: 'Green',
    7: 'Dark Green',
    8: 'Blue',
    9: 'Cream',
    10: 'Mauve',
    11: 'Purple',
    12: 'Orange',
    13: 'Brown',
    14: 'Grey',
    15: 'White',
    16: 'Black'
};

const ColourHexes = {
    0: '#1C448C', // Dark Blue
    1: '#4C7458', // Pale Green
    2: '#BC546C', // Pink
    3: '#D49C20', // Yellow
    4: '#C40000', // Red
    5: '#347084', // Light Blue
    6: '#548414', // Green
    7: '#50683C', // Dark Green
    8: '#1878DC', // Blue
    9: '#B87050', // Cream
    10: '#505074', // Mauve
    11: '#684CC4', // Purple
    12: '#FC9C00', // Orange
    13: '#7C6848', // Brown
    14: '#737573', // Grey
    15: '#B8B8B8', // White
    16: '#101010' // Black, maybe? Not used for company colours, but this is the hex for map / input backgrounds
};

const TextColourCodes = {
    BLUE: 0x00,
    SILVER: 0x01,
    GOLD: 0x02,
    RED: 0x03,
    PURPLE: 0x04,
    LIGHT_BROWN: 0x05,
    ORANGE: 0x06,
    GREEN: 0x07,
    YELLOW: 0x08,
    DARK_GREEN: 0x09,
    CREAM: 0x0A,
    BROWN: 0x0B,
    WHITE: 0x0C,
    LIGHT_BLUE: 0x0D,
    GREY: 0x0E,
    DARK_BLUE: 0x0F,
    BLACK: 0x10
};

// Sourced via https://github.com/OpenTTD/OpenTTD/blob/master/docs/ottd-colourtext-palette.png
const TextColourHexes = {
    BLUE: '#3890E8',
    SILVER: '#C8C8C8',
    GOLD: '#FCC000',
    RED: '#FC0000',
    PURPLE: '#A888E0',
    LIGHT_BROWN: '#B0B084',
    ORANGE: '#FCB030',
    GREEN: '#90E05C',
    YELLOW: '#FCF880',
    DARK_GREEN: '#B4CC7C',
    CREAM: '#D49480',
    BROWN: '#A46040',
    WHITE: '#FCFCFC',
    LIGHT_BLUE: '#80C4FC',
    GREY: '#646464',
    DARK_BLUE: '#8484A4',
    BLACK: '#101010'
};

const Landscape = {
    TEMPERATE: 0x00,
    ARCTIC: 0x01,
    TROPIC: 0x02,
    TOYLAND: 0x03
};

const NetworkErrorCode = {
    0: 'General Error', // Try to use this one like never
    
    /* Signals from clients */
    1: 'Desync',
    2: 'Savegame Failed',
    3: 'Connection Lost',
    4: 'Illegal Packet',
    5: 'Newgrf Mismatch',

    /* Signals from servers */
    6: 'Not Authorized',
    7: 'Not Expected',
    8: 'Wrong Revision',
    9: 'Name In Use',
    10: 'Wrong Password',
    11: 'Company Mismatch', // Happens in CLIENT_COMMAND
    12: 'Kicked',
    13: 'Cheater',
    14: 'Full',
    15: 'Too Many Commands',
    16: 'Timeout Password',
    17: 'Timeout Computer',
    18: 'Timeout Map',
    19: 'Timeout Join'
};

module.exports = {
    ColourNames,
    ColourHexes,
    TextColourCodes,
    TextColourHexes,
    Landscape,
    NetworkErrorCode
};
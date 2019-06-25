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
    0: '#8C441C', // Dark Blue
    1: '#58744C', // Pale Green
    2: '#6C54BC', // Pink
    3: '#209CD4', // Yellow
    4: '#0000C4', // Red
    5: '#847034', // Light Blue
    6: '#148454', // Green
    7: '#3C6850', // Dark Green
    8: '#DC7818', // Blue
    9: '#5070B8', // Cream
    10: '#745050', // Mauve
    11: '#C44C68', // Purple
    12: '#009CFC', // Orange
    13: '#48687C', // Brown
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
    BLUE: '#E89038',
    SILVER: '#C8C8C8',
    GOLD: '#00C0FC',
    RED: '#0000FC',
    PURPLE: '#E088A8',
    LIGHT_BROWN: '#84B0B0',
    ORANGE: '#30B0FC',
    GREEN: '#5CE090',
    YELLOW: '#80F8FC',
    DARK_GREEN: '#7CCCB4',
    CREAM: '#8094D4',
    BROWN: '#4060A4',
    WHITE: '#FCFCFC',
    LIGHT_BLUE: '#FCC480',
    GREY: '#848484',
    DARK_BLUE: '#A48484',
    BLACK: '#101010'
};

const Landscape = {
    TEMPERATE: 0x00,
    ARCTIC: 0x01,
    TROPIC: 0x02,
    TOYLAND: 0x03
};

module.exports = {
    ColourNames,
    ColourHexes,
    TextColourCodes,
    TextColourHexes,
    Landscape
};
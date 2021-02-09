// Permission hierarchy
const PERMLEVELS = [
    'public',
    'player',
    'mod',
    'admin',
    'owner'
];

// Config values
let ownerIDs;
let adminRoles;
let modRoles;
let playerRoles;

// Used to load permission roles from config
exports.setRoles = (rolesConfig) => {        
    ownerIDs = rolesConfig.ownerID;
    adminRoles = rolesConfig.admin;
    modRoles = rolesConfig.mod;
    playerRoles = rolesConfig.player;

    // Debug point
    global.logger.trace('owner', ownerIDs);
    global.logger.trace('admin', adminRoles);
    global.logger.trace('mod', modRoles);
    global.logger.trace('player', playerRoles);
};

// Logic to determine if use has permission requested
exports.hasPerm = (message, LEVEL = 'public') => {
    // Start at lowest permission
    let calcLevel = PERMLEVELS.indexOf('public');

    // Player role check

    // Check if permission level is set, and default if not
    if (playerRoles.length === 0) calcLevel = PERMLEVELS.indexOf('player');

    // Loop through config values to test
    playerRoles.forEach(playerRole => {
        // Use id test when possible
        if (/^\d+$/.test(playerRole)) {
            if (message.member.roles.cache.has(playerRole)) calcLevel = PERMLEVELS.indexOf('player');
        // Compare sender role names to config name
        } else {
            if (message.member.roles.cache.some(role => role.name === playerRole)) calcLevel = PERMLEVELS.indexOf('player');
        }
    });

    // Mod role check
    
    // Loop through config values to test
    modRoles.forEach(modRole => {
        // Use id test when possible
        if (/^\d+$/.test(modRole)) {
            if (message.member.roles.cache.has(modRole)) calcLevel = PERMLEVELS.indexOf('mod');
        // Compare sender role names to config name
        } else {
            if (message.member.roles.cache.some(role => role.name === modRole)) calcLevel = PERMLEVELS.indexOf('mod');
        }
    });

    // Admin role check

    // Loop through config values to test
    adminRoles.forEach(adminRole => {
        // Use id test when possible
        if (/^\d+$/.test(adminRole)) {
            if (message.member.roles.cache.has(adminRole)) calcLevel = PERMLEVELS.indexOf('admin');
        // Compare sender role names to config name
        } else {
            if (message.member.roles.cache.some(role => role.name === adminRole)) calcLevel = PERMLEVELS.indexOf('admin');
        }
    });

    // Owner check

    // Loop through config values to test
    ownerIDs.forEach(ID => {
        if (message.author.id === ID) calcLevel = PERMLEVELS.indexOf('owner');
    });

    global.logger.debug(`User Permission: ${calcLevel} (${PERMLEVELS[calcLevel]}), Required Level: ${PERMLEVELS.indexOf(LEVEL)} (${LEVEL})`);
    if (calcLevel >= PERMLEVELS.indexOf(LEVEL)) {
        return true;
    } else {
        return false;
    }
};
/*
Helper functions for working with OpenTTD data
*/
const moment = require('moment');

// Convert from OpenTTD date int to moment() object
const convertOpenttdDate = function(openttdDate) {
    // OpenTTD dates start at 1 Jan 0000
    const OPENTTD_DATE = moment().year(0).dayOfYear(1);
    OPENTTD_DATE.add(openttdDate, 'days');
    return OPENTTD_DATE;
};

module.exports = {
    convertOpenttdDate
};
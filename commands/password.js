module.exports = {
    name: 'password',
    description: 'Asks for the current OpenTTD server\'s password',
    guildOnly: true,
    openttd: true,
    alias: ['pw'],
    perm: 'player',
    cooldown: 30,
    execute(message) {
        // Get the OpenTTD server for the channel
        const openttd = message.client.channelMap.get(message.channel.id);

        // Check connection
        if (openttd.isConnected) {
            const RCONCMD = 'setting server_password';
            // Password string
            let password;
            // Update check count
            let passwordCheckCount = 0;
            // Sent bot message for edits
            let pwMessage;

            // Output or update message on channel, takes password as input
            const doPasswordMessage = function(pwd) {
                // Build text for discord
                let passwordText;
                if (pwd) {
                    passwordText = `\`Current password: ${pwd}\``;
                } else {
                    passwordText = '`There is no password for this server`';
                }
                // If we've previously output
                if (pwMessage) {
                    // Edit to update password
                    pwMessage.edit(`~~${pwMessage.content}~~\n${passwordText}`)
                        .then(() => {
                            // Update occured, stop checks
                            global.logger.debug('Password updated, ending update checks');
                            clearInterval(PASSWORDTIMER);
                        })
                        .catch(global.logger.error);
                } else {
                    // Send new reply
                    message.channel.send(passwordText)
                        .then((sentMes) => {
                            // Output returned Message back
                            pwMessage = sentMes;
                        })
                        .catch(global.logger.error);
                }
            };

            // rcon callback
            const parser = function(rcon) {
                global.logger.trace('got rcon:', rcon);
                // regexp search and store
                const pw = /Current value for 'server_password' is: '(.*)'/.exec(rcon.output);
                global.logger.trace('pw', pw);
                global.logger.trace('password', password);

                // Do nothing if passwords match
                if (pw[1] === password) {
                    return;
                }

                password = pw[1];
                doPasswordMessage(password);
            };

            // rconend callback
            const end = function(rconend) {
                global.logger.trace('Got rconend:', rconend);
                if (rconend.command === RCONCMD) {
                    // Bump counter and remove open event binds
                    passwordCheckCount += 1;
                    openttd.connection.removeListener('rcon', parser);
                    openttd.connection.removeListener('rconend', end);

                    if (passwordCheckCount >= 7) {
                        global.logger.debug('Password not updated within 30secs, ending update checks');
                        clearInterval(PASSWORDTIMER);
                    }
                }
            };

            // Start password check
            const doPasswordCheck = function() {
                // Bind to rcon
                openttd.connection.on('rcon', parser);
                openttd.connection.on('rconend', end);

                // Send rcon
                openttd.sendRcon(RCONCMD);
            };

            // Call check then schedule checks every 5 secs
            doPasswordCheck();
            const PASSWORDTIMER = setInterval(doPasswordCheck, 5000);
        } else {
            message.reply('Not connected');
        }
    }
};
# openttdiscord

![Status](https://img.shields.io/badge/stability-dev-red.svg)
![GitHub](https://img.shields.io/github/license/kenjie20/openttdiscord.svg)
![GitHub package.json version](https://img.shields.io/github/package-json/v/kenjie20/openttdiscord.svg)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/kenjie20/openttdiscord/discord.js.svg)

A Discord bot for connecting OpenTTD and Discord

## Table of Contents
+ [About](#about)
+ [Getting Started](#getting-started)
+ [Built Using](#built-using)
+ [Authors](#authors)
+ [Acknowledgments](#acknowledgements)

## About
This bot is currently very early, expect missing features & things to not work

This is a self hosted bot that connects a discord channel to an OpenTTD server via the Admin Port and passes chat messages between the two. It also gives status updates to the discord channel (e.g. player joins, new companies, etc.). It also allows admins some server management.

### Current Status
+ Connect to Discord and OpenTTD servers and pass chat between
+ Provide basic game & server info via commands

## Getting Started

### Prerequisites
```
node.js & npm
```
+ Download latest version [here](https://github.com/KenjiE20/openttdiscord/releases)
+ Run `npm install`

### Set up
+ As this bot is self hosted you will need to create your own Discord App/Bot, you can follow this [guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

+ Once you have your bot token, you can set up a config file. A commented example config is included in the config directory.
Copy `config.example.yml` to `config.yml` and copy your bot token.
You can also set another bot prefix and permission levels.
If you know channel ids, you can manually add these now, alternatively you can use the bot commands to set these up, and edit them.

### Inviting the bot
+ Run the bot with `node index.js`
+ On first run (no channels) the bot will output an invite link to the log & console. Follow this link to invite the bot to a server.

### Adding servers / channels
+ Once the bot is added to your server, you can use the `!newserver` command to create a new OpenTTD server mapping. Optionally you can pass a name, ip and port.
+ Once you have ran this on the channels you want OpenTTD relays on, run `!save` to save the new config.
+ Shut down the bot, and edit the `config.yml` file to add the OpenTTD server's admin password.
+ Restart the bot and everything should be working.

## Built Using
+ [discord.js](https://discord.js.org) - Discord API node.js module
+ [node-openttd-admin](https://www.npmjs.com/package/node-openttd-admin) - OpenTTD admin port node.js module

## Authors
+ [@kenjie20](https://github.com/kenjie20) - Idea & Initial work

See also the list of [contributors](https://github.com/kenjie20/openttdiscord/contributors) who participated in this project.

## Acknowledgements
+ [OpenTTD](https://www.openttd.org)
+ [#openttdcoop](https://www.openttdcoop.org)
+ [Supybot OpenTTD Administration Plugin](https://dev.openttdcoop.org/projects/soap)
+ [Discord.js Guide](https://discordjs.guide/) & [An Idiot's Guide](https://anidiots.guide/)
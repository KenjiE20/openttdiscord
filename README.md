# openttdiscord

![Status](https://img.shields.io/badge/stability-dev-red.svg)
![GitHub](https://img.shields.io/github/license/kenjie20/openttdiscord.svg)
![GitHub package.json version](https://img.shields.io/github/package-json/v/kenjie20/openttdiscord.svg)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/kenjie20/openttdiscord/discord.js.svg)

A Discord bot for connecting OpenTTD and Discord

## Table of Contents

-   [About](#about)
-   [Getting Started](#getting-started)
-   [Built Using](#built-using)
-   [Authors](#authors)
-   [Acknowledgments](#acknowledgements)

## About

This bot is currently very early, expect things to not work

This bot connects a discord channel to an OpenTTD server via the Admin Port and passes chat messages between the two. It also gives status updates to the discord channel (e.g. player joins, new companies, etc.)

## Getting Started

### Prerequisites

```
node.js & npm

(Optional)
pm2
```

### How To Install

```
npm i
```

### How To Start The Bot

First, make a `config.yml` file on `config` folder based on the `config.example.yml`. Don't forget to add your Discord Bot Token (which you can get for free from Discord Developer Portal). After you set the config, run the following code run the bot. You can also do `npm i -g nodemon` once on your computer and then run the bot by `npm run dev` while you are developing something on the bot since that way, the nodemon daemon will restart the bot every time you make a change to any of the files(be careful with that tho because if you do CTRL+S very frequently, nodemon will restart on each save and eventually Discord will block your IP address for a while(like 5-10 minutes), so don't hit CTRL+S very frequently while working with a Discord bot.)

```
npm run start
```

## Built Using

-   [discord.js](https://discord.js.org) - Discord API node.js module
-   [node-openttd-admin](https://www.npmjs.com/package/node-openttd-admin) - OpenTTD admin port node.js module

## Authors

-   [@kenjie20](https://github.com/kenjie20) - Idea & Initial work

See also the list of [contributors](https://github.com/kenjie20/openttdiscord/contributors) who participated in this project.

## Acknowledgements

-   [OpenTTD](https://www.openttd.org)
-   [#openttdcoop](https://www.openttdcoop.org)
-   [Supybot OpenTTD Administration Plugin](https://dev.openttdcoop.org/projects/soap)
-   [Discord.js Guide](https://discordjs.guide/) & [An Idiot's Guide](https://anidiots.guide/)

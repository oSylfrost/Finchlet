const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log('[WARNING] The command at ' + filePath + ' is missing a required "data" or "execute" property.');
        }
    }
}

const rest = new REST().setToken(process.env.BOTTOKEN);

(async () => {
    try {
        console.log('[INFO] Updating ' + commands.length + ' commands.');

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENTID, process.env.SERVERID),
            { body: commands },
        );

        console.log('[INFO] Updated ' + data.length + ' commands!');
    } catch (error) {
        console.error(error);
    }
})();
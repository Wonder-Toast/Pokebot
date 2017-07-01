const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const fs = require('fs');
const { prefix, token } = require('./config');

const client = new CommandoClient({
  commandPrefix: prefix,
  unknownCommandResponse: false,
  owner: ['193378071141810176', '138431969418543104'],
  clientOptions: { disabledEvents: ['USER_NOTE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE', 'PRESENCE_UPDATE'] },
  disableEveryone: true,
  invite: 'https://discord.gg/A8jBRN9'
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['util', 'Utility'],
    ['pokemon', 'Pokemon'],
    ['commands', 'Commands'],
  	['sudo', 'Owners']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({ ping: false, help: false })
  .registerCommandsIn(path.join(__dirname, 'commands'));

sqlite.open(path.join(__dirname, 'assets', 'sqlite', 'settings.sqlite3')).then((db) => {
  client.setProvider(new SQLiteProvider(db));
});

fs.readdir(`${__dirname}/events/`, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const eventFunction = require(`${__dirname}/events/${file}`);
    const eventName = file.split('.')[0];
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
  });
});

client.login(token);

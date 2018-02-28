const path = require('path');
const fs = require('fs');
const { prefix } = require('../config.json');
const statsPath = path.join(__dirname, '..', 'assets', 'json', 'stats.json');

exports.run = async (client, msg) => {
  if (msg.channel.type === 'dm') return;
  const stats = await JSON.parse(fs.readFileSync(statsPath));
  stats.messages++;
  fs.writeFileSync(statsPath, JSON.stringify(stats));
  if (msg.author.bot) return;
  if (msg.content.startsWith(msg.guild ? msg.guild.commandPrefix : prefix)) {
    stats.commands++;
    fs.writeFileSync(statsPath, JSON.stringify(stats));
    
  }
}

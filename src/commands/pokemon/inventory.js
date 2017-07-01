const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');

module.exports = class InventoryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'inventory',
      group: 'pokemon',
      memberName: 'inventory',
      description: 'Shows your or others pokemon inventory.',
      details: 'Catch pokemon with the pokemon command.\nYou can view your or others pokemon with this command.',
      examples: ['inventory', 'inventory @user'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Who\'s pokemon inventory would you like to view?\n',
          type: 'user',
          default: ''
        }
      ],
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async run(msg, args) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data/pokemon.json'), 'utf8'));
    const user = args.user || msg.author;

    if (!data[user.id]) return msg.say('That user has no pokemon!');

    const toSend = new Array();
    Object.keys(data[user.id].pokemon).forEach(key => {
      toSend.push(data[user.id].pokemon[key].name);
    });

    function showPage(page, m) {
      if (toSend.length < 20) return m.edit(':no_entry_sign: No Pokemon on this page!');
      let start = page * 10;
      start += page;
      let stop = start + 20;
      m.edit(`__**${user.username}'s Pokemon:**__ Includes **${toSend.length}/151** Pokemon. [Page ${page} (20 shown)]\n**${toSend.slice(start, stop).join('\n')}**`);
      m.awaitReactions((reaction, user) => user.id === msg.author.id, {
        max: 1,
        time: 30000
      }).then(reactions => {
        if (reactions.first() == undefined) return;
        if (reactions.first().emoji.name == '➡') {
          showPage(page + 1, m);
        } else if (reactions.first().emoji.name == '⬅') {
          if (page === 1) msg.reply(':no_entry_sign: You can\'t go back a page if you\'re on page 1!');
          else showPage(page - 1, m);
        } else if (reactions.first().emoji.name == '❌') {
          return m.edit('Pokemon inventory session ended.');
        }
      }).catch(() => m.edit('Pokemon inventory session ended.'));
    }

    const m = await msg.say(`__**${user.username}'s Pokemon:**__ Includes **${toSend.length}/151** Pokemon. [Page 1] \n**${toSend.slice(0, 20).join('\n')}**`);
    m.react('⬅').then(() => m.react('➡').then(() => m.react('❌')));
    m.awaitReactions((reaction, user) => user.id === msg.author.id, {
      max: 1,
      time: 30000
    }).then(reactions => {
      if (reactions.first() == undefined) return;
      if (reactions.first().emoji.name == '➡') {
        showPage(2, m);
      } else if (reactions.first().emoji.name == '⬅') {
        msg.reply(':no_entry_sign: You can\'t go back a page if you\'re on page 1!');
      } else if (reactions.first().emoji.name == '❌') {
        return m.edit('Pokemon inventory session ended.');
      }
    }).catch(() => m.edit('Pokemon inventory session ended.'));

  }
};

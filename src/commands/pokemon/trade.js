
const events = require('events');
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '..', '..', 'data/pokemon1.json');

module.exports = class TradeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trade',
      group: 'pokemon',
      memberName: 'trade',
      description: 'Shows your or others pokemon.',
      details: 'Catch pokemon with the pokemon command.\nYou can trade the pokemon you catch with this command.',
      examples: ['trade @user pikachu charzard'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Who would you like to trade Pokemon with?\n',
          type: 'user'
        },
        {
          key: 'pokemon1',
          prompt: 'What Pokemon will you trade with them?\n',
          type: 'string'
        },
        {
          key: 'pokemon2',
          prompt: 'What Pokemon will they trade with you?\n',
          type: 'string'
        }
      ],
      throttling: {
        usages: 1,
        duration: 60
      }
    });
  }

  async run(msg, args) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let { user, pokemon1, pokemon2 } = args;
    function cap(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    pokemon1 = cap(pokemon1);
    pokemon2 = cap(pokemon2);
    if (!data[msg.author.id]) return msg.reply(':no_entry_sign: You can\'t trade Pokemon if you have no Pokemon!');
    if (!data[user.id]) return msg.say(`<@${user.id}>, :no_entry_sign: You can't trade if you have no Pokemon!`);

    if (!data[msg.author.id].pokemon[pokemon1]) return msg.reply(`:no_entry_sign: You don\'t have **${pokemon1}** so you can't trade it!`);
    if (!data[user.id].pokemon[pokemon2]) return msg.say(`<@${user.id}>, :no_entry_sign: You don\'t have **${pokemon2}** so you can't trade it!`);

    const trade = function trade() {
      if (data[msg.author.id].pokemon[pokemon2]) {
        data[msg.author.id].pokemon[pokemon1].count++;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      } else {
        data[msg.author.id].pokemon[pokemon2] = {
          name: pokemon2,
          gif: `http://www.pokestadium.com/sprites/xy/${pokemon2.toLowerCase()}.gif`,
          count: 1
        }
      }

      if (data[user.id].pokemon[pokemon1]) {
        data[user.id].pokemon[pokemon1].count++;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      } else {
        data[user.id].pokemon[pokemon1] = {
          name: pokemon1,
          gif: `http://www.pokestadium.com/sprites/xy/${pokemon1.toLowerCase()}.gif`,
          count: 1
        }
      }

      delete data[msg.author.id].pokemon[pokemon1];
      delete data[user.id].pokemon[pokemon2];

      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

      msg.say(`:white_check_mark: **${msg.author.username}**#${msg.author.discriminator} has successfully traded a **${pokemon1}** for a **${pokemon2}** with **${user.username}**#${user.discriminator}!`)
    }

    const embed1 = new RichEmbed();
    embed1.setColor(0xFF0000)
      .setTitle('Pokemon Trade Confirmation')
      .setDescription(`Between ${msg.author.tag} and ${user.tag}`)
      .setAuthor(msg.author.username, msg.author.avatarURL)
      .addField(`Do you confirm to trade your **${pokemon1}** with **${user.username}**'s **${pokemon2}**?`, '**__y__es** or **__n__o**?');
    msg.embed(embed1);

   msg.channel.awaitMessages(response => ['y', 'yes', 'n', 'no', 'cancel'].includes(response.content.toLowerCase()) && response.author.id === msg.author.id, {
			max: 1,
			time: 15000
		}).then(async (collected) => {
      const co = new Array();
      const coMap = collected.map((m) => co.push(m));

			if (['yes', 'y'].includes(co[0].content) && co[0].author.id === msg.author.id) {
        msg.say(`<@${co[0].author.id}>, :white_check_mark: okay.`);

        const embed2 = new RichEmbed();
        embed2.setColor(0xFF0000)
          .setTitle('Pokemon Trade Confirmation')
          .setDescription(`Between ${msg.author.tag} and ${user.tag}`)
          .setAuthor(user.username, user.avatarURL)
          .addField(`Do you confirm to trade your **${pokemon2}** with **${msg.author.username}**'s **${pokemon1}**?`, '**__y__es** or **__n__o**?');
        msg.embed(embed2);

        msg.channel.awaitMessages(m => ['y', 'yes', 'n', 'no', 'cancel'].includes(m.content.toLowerCase()) && m.author.id === user.id, {
       		max: 1,
       	  time: 15000
       	}).then(async (collected1) => {
          const co1 = new Array();
          const co1Map = collected1.map((m) => co1.push(m));
          try {
            if (['yes', 'y'].includes(co1[0].content.toLowerCase()) && co1[0].author.id === user.id) {
              msg.say(`<@${co1[0].author.id}>, :white_check_mark: okay.`);
              pokemonEvent.emit('secondConfirm');
            } else if (['n', 'no', 'cancel'].incudes(co1[0].content.toLowerCase()) && co1[0].author.id === user.id) {
              return msg.say(`Okay. Cancelling trade between **${msg.author.username}** and **${user.username}**.`);
            }
          } catch(err) { //try catch b/c of unknown ['n', 'no', 'cancel'].includes is not a func error
            return msg.say(`Okay. Cancelling trade between **${msg.author.username}** and **${user.username}**.`);
          }
        }).catch(() => msg.say(`Cancelling trade between **${msg.author.username}** and **${user.username}**. Took longer than 15 seconds for a reply.`));

      } else if (['n', 'no', 'cancel'].incudes(co[0].content.toLowerCase()) && co[0].author.id === msg.author.id) {
        return msg.say(`Okay. Cancelling trade between **${msg.author.username}** and **${user.username}**.`);
      }

      pokemonEvent.once('secondConfirm', trade);

		}).catch(() => msg.say(`Cancelling trade between **${msg.author.username}** and **${user.username}**. Took longer than 15 seconds for a reply.`));

  }

};

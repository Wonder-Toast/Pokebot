const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
  constructor(client) {
      super(client, {
        name: 'ping',
        group: 'util',
        memberName: 'ping',
        description: 'Checks the bot\'s ping.',
        throttling: {
          usages: 2,
          duration: 3
        }
      });
  }

  async run(msg) {
		if (!msg.editable) {
			const pingMsg = await msg.say('*Pinging...*');
      return pingMsg.edit(`:ping_pong: **Pong!**\nMessage latency: **${pingMsg.createdTimestamp - msg.createdTimestamp}ms**\nDiscord Latency: **${Math.round(this.client.ping)}ms**`);
		} else {
			await msg.edit('*Pinging...*');
      return pingMsg.edit(`:ping_pong: **Pong!**\nMessage latency: **${pingMsg.createdTimestamp - msg.createdTimestamp}ms**\nDiscord Latency: **${Math.round(this.client.ping)}ms**`);
		}
	}
};

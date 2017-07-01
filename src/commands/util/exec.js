const { Command } = require('discord.js-commando');
const { exec } = require('child_process');

module.exports = class ExecuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'exec',
			aliases: ['execute'],
			group: 'util',
			memberName: 'exec',
			description: 'Executes command in the shell.',
			details: 'Only the bot owner can use this.',
			args: [
				{
					key: 'code',
					prompt: 'What would you like to execute?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.options.owner.includes(msg.author.id);
	}

	async run(msg, args) {
		exec(args.code, (err, stdout, stderr) => {
			if (err) return msg.channel.send(err.message, { code: '' });
			return msg.channel.send(stdout, { code: '' });
		});
	}
};

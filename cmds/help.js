const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'help',
    description: 'List all available commands',
    execute(api, event) {
        const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
        let message = 'C ° O ° M ° M ° A ° N ° D ° S\n\n';

        commandFiles.forEach(file => {
            const command = require(`./${file}`);
            message += `[~] ${command.name}\n[°°°] ${command.description}\n\n`;
        });
        api.sendMessage(message, event.threadID);
    }
};

module.exports.restart = {
    name: 'restart',
    description: 'Reboot the bot',
    execute(api, event, args) {
        api.sendMessage('Rebooting Please wait...', event.threadID, () => {
            process.exit(0);
        });
    }
};
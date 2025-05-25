const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'ai',
    description: 'Ask an AI question with grok-2',
    async execute(api, event, args) {
        const question = args.join(' ');

        if (!question) {
            api.sendMessage(`Please enter a question.\nUsage: ${config.prefix}ai <your question>`, event.threadID, event.messageID);
            return;
        }

        api.sendMessage("Generating...", event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://ajiro.gleeze.com/api/ai?model=grok-2&system=You are a LLM called groq invented by elon musk&question=${encodeURIComponent(question)}`);
            if (response.data.success) {
                api.sendMessage(`{}=====GROK-2====={}\n\n` + response.data.response, event.threadID, event.messageID);
            } else {
                api.sendMessage("There was an error processing your request. Please try again later.", event.threadID, event.messageID);
            }
        } catch (error) {
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID, event.messageID);
        }
    }
};
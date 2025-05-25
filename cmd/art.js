// /cmds/art.js
const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'art',
    description: 'Generate an AI image based on the provided prompt',
    async execute(api, event, args) {
        const prompt = args.join(' ');

        if (!prompt) {
            api.sendMessage(`Please provide a prompt for the image.\nUsage: ${config.prefix}art <your prompt>`, event.threadID, event.messageID);
            return;
        }

        api.sendMessage("Generating your image, please wait...", event.threadID, event.messageID);

        try {
            // Fetch the image from the API
            const response = await axios.get(`https://ajiro.gleeze.com/api/art?prompt=${encodeURIComponent(prompt)}`, {
                responseType: 'arraybuffer' // Set response type to arraybuffer to handle binary data
            });

            // Check if the response is successful
            if (response.status === 200) {
                // Create a buffer from the response data
                const imageBuffer = Buffer.from(response.data, 'binary');

                // Save the image temporarily
                const tempFilePath = './temp_image.png';
                fs.writeFileSync(tempFilePath, imageBuffer);

                // Send the image back to the user
                api.sendMessage({
                    body: `Image generated for "${prompt}":`,
                    attachment: fs.createReadStream(tempFilePath) // Use a readable stream from the saved file
                }, event.threadID, (err) => {
                    // Clean up the temporary file after sending
                    fs.unlinkSync(tempFilePath);
                    if (err) {
                        console.error("Error sending the image:", err);
                    }
                });
            } else {
                api.sendMessage("Failed to generate the image. Please try again later.", event.threadID, event.messageID);
            }
        } catch (error) {
            console.error("Error fetching image:", error);
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID, event.messageID);
        }
    }
};
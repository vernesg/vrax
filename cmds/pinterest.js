// /cmds/pinterest.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8')); // Load configuration

module.exports = {
    name: 'pinterest',
    description: 'Fetch images based on a prompt from Pinterest',
    async execute(api, event, args) {
        const prompt = args.join(' '); // Combine arguments into a single prompt

        if (!prompt) {
            api.sendMessage(`Please provide a prompt.\nUsage: ${config.prefix}pinterest <your prompt>`, event.threadID, event.messageID);
            return;
        }

        api.sendMessage("Fetching image(s), please wait...", event.threadID, event.messageID);

        try {
            // Fetch images from the Pinterest API
            const response = await axios.get(`https://ajiro.gleeze.com/api/pinterest?text=${encodeURIComponent(prompt)}`);

            // Check if the response is successful
            if (response.data.status) {
                const images = response.data.result;

                if (images.length === 0) {
                    api.sendMessage("No images found for the given prompt.", event.threadID, event.messageID);
                    return;
                }

                // Prepare to send images
                const imagePaths = [];

                for (const imageUrl of images) {
                    // Download each image
                    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

                    // Create a temporary file path
                    const tempFilePath = path.join(__dirname, `temp_image_${Date.now()}.jpg`);
                    fs.writeFileSync(tempFilePath, imageBuffer);
                    imagePaths.push(tempFilePath);
                }

                // Send all images back to the user in one message
                const attachments = imagePaths.map(imagePath => fs.createReadStream(imagePath));

                // Send the message with attachments
                api.sendMessage({
                    body: `Here are the images for "${prompt}":`,
                    attachment: attachments // Send all images as attachments
                }, event.threadID, (err) => {
                    // Clean up the temporary files after sending
                    imagePaths.forEach(imagePath => fs.unlinkSync(imagePath));
                    if (err) {
                        console.error("Error sending the images:", err);
                    }
                });
            } else {
                api.sendMessage("Failed to fetch images. Please try again later.", event.threadID, event.messageID);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID, event.messageID);
        }
    }
};
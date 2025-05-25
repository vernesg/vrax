// /cmds/ss.js
const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'ss',
    description: 'Take a screenshot of a website based on the provided URL',
    async execute(api, event, args) {
        const url = args.join(' ');

        if (!url) {
            api.sendMessage(`Please provide a URL.\nUsage: ${config.prefix}ss <url>`, event.threadID, event.messageID);
            return;
        }

        api.sendMessage("Taking a screenshot, please wait...", event.threadID, event.messageID);

        try {
            // Fetch the screenshot from the API
            const response = await axios.get(`https://zaikyoo.onrender.com/api/screenshot?url=${encodeURIComponent(url)}`, {
                responseType: 'arraybuffer' // Set response type to arraybuffer to handle binary data
            });

            // Check if the response is successful
            if (response.status === 200) {
                // Create a buffer from the response data
                const imageBuffer = Buffer.from(response.data, 'binary');

                // Save the image temporarily if needed (optional)
                const tempFilePath = './temp_screenshot.jpg';
                fs.writeFileSync(tempFilePath, imageBuffer);

                // Send the image back to the user
                api.sendMessage({
                    body: "Here is the screenshot:",
                    attachment: fs.createReadStream(tempFilePath) // Use a readable stream from the saved file
                }, event.threadID, (err) => {
                    // Clean up the temporary file after sending
                    fs.unlinkSync(tempFilePath);
                    if (err) {
                        console.error("Error sending the screenshot:", err);
                    }
                });
            } else {
                api.sendMessage("Failed to take a screenshot. Please try again later.", event.threadID, event.messageID);
            }
        } catch (error) {
            console.error("Error fetching screenshot:", error);
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID, event.messageID);
        }
    }
};
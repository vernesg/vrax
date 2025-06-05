const fs = require("fs");
const login = require("ws3-fca");
const express = require("express");
const app = express();

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// Load appstate from appstate.json
let appState = null;
try {
    appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
} catch (error) {
    console.error("Failed to load appstate.json", error);
}

const port = config.port || 3000;  // Use the port from config.json or default to 3000

// Load commands from the cmds folder
const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
console.log("\n\n\n");
console.log("=====COMMANDS LOADED=====");
console.log("====={}=====");
commandFiles.forEach(file => {
    console.log(`[~] ${file.replace('.js', '')}`);
});
console.log("====={}=====");
console.log("\n\n\n");

// Load command modules into an object
const commands = {};
commandFiles.forEach(file => {
    const command = require(`./cmds/${file}`);
    commands[command.name] = command;
});

// Determine login method
let loginCredentials;
if (appState && appState.length !== 0) {
    loginCredentials = {
        appState: appState
    };
} else {
    console.error("No valid login method found in appstate.json");
    process.exit(1);
}

login(loginCredentials, (err, api) => {
    if (err) return console.error(err);  // Handle login errors

    // Set the bot's options for its behavior and connection
    api.setOptions({
        forceLogin: true,
        listenEvents: true,
        logLevel: "silent",
        updatePresence: true,
        bypassRegion: "PNB",
        selfListen: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0",
        online: true,
        autoMarkDelivery: true,
        autoMarkRead: true
    });

    // Function to change bot's bio
    function updateBotBio(api) {
        const bio = `Prefix: ${config.prefix}\nOwner: ${config.botOwner}`;
        api.changeBio(bio, (err) => {
            if (err) {
                console.error("Failed to update bot bio:", err);
            } else {
                console.log("Bot bio updated successfully.");
            }
        });
    }

    // Call the function to update bot's bio after login
    updateBotBio(api);
    console.log("[ Bilyabits-Hub ] Refreshing fb_dtsg every 1 hour");

    // Notify the user that the bot is online with basic information
    const adminUserThread = config.adminID; // Admin user thread ID
    const botID = api.getCurrentUserID();
    api.sendMessage(`I am online!\nBot Owner Name: ${config.botOwnerName}\nBot ID: ${botID}`, adminUserThread);

    // Function to refresh fb_dtsg every 1 hour
    const refreshInterval = 60 * 60 * 1000; // 20 minutes in milliseconds
    setInterval(() => {
        api.refreshFb_dtsg(); // Call the refresh function
        console.log("Refreshed fb_dtsg at:", new Date().toLocaleString()); // Log the event
    }, refreshInterval);

    // Function to handle commands
    function handleCommand(event) {
        const prefix = config.prefix;
        const message = event.body;

        if (!message.startsWith(prefix)) return;

        const args = message.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!commandName) {
            api.sendMessage("No command input, please type `/help` for available commands.", event.threadID);
            return;
        }

        if (!commands[commandName]) {
            api.sendMessage("This command is not available or it is invalid.", event.threadID);
            return;
        }

        // Execute the command
        try {
            commands[commandName].execute(api, event, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            api.sendMessage(`There was an error executing the ${commandName} command.`, event.threadID);
        }
    }

    // Start listening for incoming messages and events with detailed logging
    const stopListening = api.listenMqtt((err, event) => {
        if (err) return console.error("Error while listening:", err);  // Handle any errors while listening

        console.log("Event received:", event);  // Log all events for debugging

        switch (event.type) {
            case "message":
                handleCommand(event);
                break;
            case "event":
                console.log("Other event type:", event);  // Log any other event type
                break;
        }
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Define a simple route
app.get("/", (req, res) => {
    res.send("Bot is running");
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

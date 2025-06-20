import * as dotenv from "dotenv";
dotenv.config();
import { Client, GatewayIntentBits } from "discord.js";
import crypto from "crypto";
import { jokes } from "./jokes.js";

// Track recently shown jokes per user (last 3 jokes)
const userRecentJokes = new Map();

// Function to get random joke with better randomness and no repetition
function getRandomJoke(userId) {
    let availableJokes = [...jokes];
    
    // Remove recently shown jokes for this user
    if (userRecentJokes.has(userId)) {
        const recentIndices = userRecentJokes.get(userId);
        availableJokes = jokes.filter((_, index) => !recentIndices.includes(index));
        
        // If all jokes were recent, reset and use all jokes
        if (availableJokes.length === 0) {
            availableJokes = [...jokes];
            userRecentJokes.set(userId, []);
        }
    }
    
    // Use crypto for better randomness
    const randomBytes = crypto.randomBytes(4);
    const randomIndex = randomBytes.readUInt32BE(0) % availableJokes.length;
    const selectedJoke = availableJokes[randomIndex];
    
    // Update user's recent jokes
    const originalIndex = jokes.indexOf(selectedJoke);
    updateUserRecentJokes(userId, originalIndex);
    
    return selectedJoke;
}

// Update user's recent jokes list
function updateUserRecentJokes(userId, jokeIndex) {
    if (!userRecentJokes.has(userId)) {
        userRecentJokes.set(userId, []);
    }
    
    const recent = userRecentJokes.get(userId);
    recent.push(jokeIndex);
    
    // Keep only last 3 jokes
    if (recent.length > 3) {
        recent.shift();
    }
}

// Create client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once("ready", () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
    // Ignore bot's own messages
    if (message.author.bot) return;

    // Check if message starts with /nukta
    if (message.content.toLowerCase().startsWith("/nukta")) {
        const randomJoke = getRandomJoke(message.author.id);
        message.reply(randomJoke);
        return;
    }
    if (message.content.toLowerCase().startsWith("fin")) {
        message.reply("fkrk");
        return;
    }
    if (message.content.toLowerCase().startsWith("chkun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("ktsme3ni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("katsm3uni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("katsema3ni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("ktsm3uni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("ktsm3ni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("katsam3ni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("katsma3ni")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("katsma3nii")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("كتسمعني")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().endsWith("ني")) {
        message.reply("tabon mok fih lmani");
        return;
    }
    if (message.content.toLowerCase().startsWith("shkun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("shkoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("chkoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("shekoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("شكون")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("chekoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().startsWith("who")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("do")) {
        message.reply("khechah fik ojebdu");
        return;
    }
    if (message.content.toLowerCase().endsWith("ni")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("ni?")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("un")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("on")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("on?")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("un?")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().endsWith("ach")) {
        message.reply("swtek mteki 3liha zyach");
        return;
    }
    if (message.content.toLowerCase().endsWith("ach?")) {
        message.reply("swtek mteki 3liha zyach");
        return;
    }
    if (message.content.toLowerCase().endsWith("ash")) {
        message.reply("swtek mteki 3liha zyach");
        return;
    }
    if (message.content.toLowerCase().endsWith("ash?")) {
        message.reply("swtek mteki 3liha zyach");
        return;
    }
});

client.login(process.env.TOKEN);
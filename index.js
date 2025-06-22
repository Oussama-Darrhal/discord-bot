import * as dotenv from "dotenv";
dotenv.config();
import { Client, GatewayIntentBits } from "discord.js";
import crypto from "crypto";
import { getJokes, addJoke, updateJokeScore, jokeMessageMap } from "./jokes.js";
import { musicCommands, initializePlayer } from "./music.js";
import { connectToDatabase } from "./database.js";

// Track recently shown jokes per user (last 3 jokes)
const userRecentJokes = new Map();

// Function to get weighted random joke based on score
async function getWeightedRandomJoke(userId) {
    const jokes = await getJokes();
    let availableJokes = [...jokes];

    // Remove recently shown jokes for this user
    if (userRecentJokes.has(userId)) {
        const recentIndices = userRecentJokes.get(userId);
        availableJokes = jokes.filter(joke => !recentIndices.includes(joke.id));

        // If all jokes were recent, reset and use all jokes
        if (availableJokes.length === 0) {
            availableJokes = [...jokes];
            userRecentJokes.set(userId, []);
        }
    }

    // Calculate weights based on score
    const weights = availableJokes.map(joke => {
        let weight = 1; // Base weight

        if (joke.score >= 10) {
            weight = 5; // Hall of fame jokes appear 5x more
        } else if (joke.score >= 5) {
            weight = 3; // High score jokes appear 3x more
        } else if (joke.score >= 1) {
            weight = 2; // Positive jokes appear 2x more
        } else if (joke.score <= -3) {
            weight = 0.2; // Negative jokes appear rarely
        }

        return weight;
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableJokes.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            const selectedJoke = availableJokes[i];
            updateUserRecentJokes(userId, selectedJoke.id);
            return selectedJoke;
        }
    }

    // Fallback to last joke
    const selectedJoke = availableJokes[availableJokes.length - 1];
    updateUserRecentJokes(userId, selectedJoke.id);
    return selectedJoke;
}

// Update user's recent jokes list
function updateUserRecentJokes(userId, jokeId) {
    if (!userRecentJokes.has(userId)) {
        userRecentJokes.set(userId, []);
    }

    const recent = userRecentJokes.get(userId);
    recent.push(jokeId);

    // Keep only last 3 jokes
    if (recent.length > 3) {
        recent.shift();
    }
}

// Format joke for display
function formatJoke(joke) {
    const hallOfFame = joke.score >= 10 ? " ⭐" : "";
    const authorMention = joke.authorId !== "system" ? `<@${joke.authorId}>` : joke.author;

    return `${joke.text}${hallOfFame}\n\n👤 **Submitted by:** ${authorMention}\n📊 **Score:** ${joke.score >= 0 ? '+' : ''}${joke.score} (👍 ${joke.upvotes} | 👎 ${joke.downvotes})`;
}

// Create client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once("ready", async () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    
    // Connect to MongoDB
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
    
    // Initialize the music player
    initializePlayer(client);
});

client.on("messageCreate", async (message) => {
    // Ignore bot's own messages
    if (message.author.bot) return;

    // Check if message starts with /nukta
    if (message.content.toLowerCase().startsWith("/nukta")) {
        try {
            const randomJoke = await getWeightedRandomJoke(message.author.id);
            const formattedJoke = formatJoke(randomJoke);

            const sentMessage = await message.reply(formattedJoke);

            // Store mapping for reaction handling
            jokeMessageMap.set(sentMessage.id, randomJoke.id);

            // Auto-react with voting emojis
            await sentMessage.react('👍');
            await sentMessage.react('👎');

            // Add hall of fame reaction if score is high enough
            if (randomJoke.score >= 10) {
                await sentMessage.react('⭐');
            }
        } catch (error) {
            console.error('Error sending joke:', error);
        }
        return;
    }

    // Check if message starts with /submit
    if (message.content.toLowerCase().startsWith("/submit ")) {
        const jokeText = message.content.slice(8).trim(); // Remove "/submit "

        if (!jokeText) {
            message.reply("❌ Please provide a joke to submit! Usage: `/submit [your joke here]`");
            return;
        }

        if (jokeText.length > 500) {
            message.reply("❌ Joke is too long! Please keep it under 500 characters.");
            return;
        }

        try {
            const newJoke = await addJoke(jokeText, message.author.username, message.author.id);
            const confirmationMessage = await message.reply(`✅ **Joke submitted successfully!**\n`);

            // Store mapping for reaction handling
            jokeMessageMap.set(confirmationMessage.id, newJoke.id);

        } catch (error) {
            console.error('Error submitting joke:', error);
            message.reply("❌ There was an error submitting your joke. Please try again.");
        }
        return;
    }

    // Music commands
    if (message.content.toLowerCase().startsWith("$play ")) {
        const songArgs = message.content.slice(6).trim().split(/ +/); // Remove "$play " and split
        console.log('Play command args:', songArgs);
        return musicCommands.play(message, songArgs);
    }

    if (message.content.toLowerCase().startsWith("$pause")) {
        return musicCommands.pause(message);
    }

    if (message.content.toLowerCase().startsWith("$resume")) {
        return musicCommands.resume(message);
    }

    if (message.content.toLowerCase().startsWith("$skip")) {
        return musicCommands.skip(message);
    }

    if (message.content.toLowerCase().startsWith("$queue")) {
        return musicCommands.queue(message);
    }

    if (message.content.toLowerCase().startsWith("$nowplaying")) {
        return musicCommands.nowplaying(message);
    }

    if (message.content.toLowerCase().startsWith("$leave")) {
        return musicCommands.leave(message);
    }

    // Existing response patterns
    if (message.content.toLowerCase().includes("fink")) {
        message.reply("fkrk");
        return;
    }
    if (message.content.toLowerCase().includes("fin")) {
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
    if (message.content.toLowerCase().includes("shkun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("shkoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("chkoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("shekoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("شكون")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("شكون")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("chekoun")) {
        message.reply("li 7wak");
        return;
    }
    if (message.content.toLowerCase().includes("who")) {
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

// Handle reaction events for voting
client.on("messageReactionAdd", async (reaction, user) => {
    // Ignore bot reactions and reactions from the bot itself
    if (user.bot) return;

    // Handle partial reactions
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    const messageId = reaction.message.id;
    const jokeId = jokeMessageMap.get(messageId);

    if (!jokeId) return; // Not a joke message

    const emoji = reaction.emoji.name;

    if (emoji === '👍' || emoji === '👎') {
        const isUpvote = emoji === '👍';
        const updatedJoke = await updateJokeScore(jokeId, user.id, isUpvote);

        if (updatedJoke) {
            try {
                // Update the message with new score
                const newContent = formatJoke(updatedJoke);
                await reaction.message.edit(newContent);

                // Add hall of fame reaction if score reaches 10
                if (updatedJoke.score >= 10 && !reaction.message.reactions.cache.has('⭐')) {
                    await reaction.message.react('⭐');
                }
            } catch (error) {
                console.error('Error updating joke score:', error);
            }
        }
    }
});

// Handle reaction removal
client.on("messageReactionRemove", async (reaction, user) => {
    // Ignore bot reactions
    if (user.bot) return;

    // Handle partial reactions
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    const messageId = reaction.message.id;
    const jokeId = jokeMessageMap.get(messageId);

    if (!jokeId) return; // Not a joke message

    const emoji = reaction.emoji.name;

    if (emoji === '👍' || emoji === '👎') {
        const isUpvote = emoji === '👍';
        const updatedJoke = await updateJokeScore(jokeId, user.id, isUpvote);

        if (updatedJoke) {
            try {
                // Update the message with new score
                const newContent = formatJoke(updatedJoke);
                await reaction.message.edit(newContent);
            } catch (error) {
                console.error('Error updating joke score:', error);
            }
        }
    }
});

client.login(process.env.TOKEN);
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

let client;
let db;
let jokesCollection;

// MongoDB connection
export async function connectToDatabase() {
    try {
        const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@discord-bot.plggjhf.mongodb.net/?retryWrites=true&w=majority&appName=discord-bot`;
        
        client = new MongoClient(uri);
        await client.connect();
        
        db = client.db(process.env.DB_NAME || 'discord-bot');
        jokesCollection = db.collection('jokes');
        
        console.log('✅ Connected to MongoDB');
        
        // Initialize with default jokes if collection is empty
        await initializeDefaultJokes();
        
        return { db, jokesCollection };
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

// Initialize default jokes if the collection is empty
async function initializeDefaultJokes() {
    try {
        const count = await jokesCollection.countDocuments();
        
        if (count === 0) {
            console.log('Initializing database with default jokes...');
            
            const defaultJokes = [
                {
                    id: 1,
                    text: "galek hada wa7ed n3es m3a 8.... o 7waha",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 2,
                    text: "3lach limona ktsena gedam bab jame3?........   katsena l3aser",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 3,
                    text: "3lach trya ktmchi toilet?....... 7yt fiha lbola",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 4,
                    text: "3lach tonobilat aydekhlo jahenam?.....   7yt fihom lkofer",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 5,
                    text: "3lach lfquih g3ma 3ziz 3lih chelada?....... 7yt fiha ikhtilat",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 6,
                    text: "ch7al ktbqa mra 3zeya f toilet?........................... 9 chhor",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 7,
                    text: "galek hada wa7ed chera stylo khder..... omcha teybo",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 8,
                    text: "chnu huwa dad dyal telmidat?......... huwa donttelmidat",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                },
                {
                    id: 9,
                    text: "3lach yonan g3ma ki3rfo i3omo?........... 7yt ighriq",
                    author: "System",
                    authorId: "system",
                    timestamp: Date.now(),
                    score: 0,
                    upvotes: 0,
                    downvotes: 0,
                    voters: []
                }
            ];
            
            await jokesCollection.insertMany(defaultJokes);
            console.log(`✅ Inserted ${defaultJokes.length} default jokes`);
        }
    } catch (error) {
        console.error('Error initializing default jokes:', error);
    }
}

// Get all jokes from database
export async function getAllJokes() {
    try {
        const jokes = await jokesCollection.find({}).toArray();
        return jokes;
    } catch (error) {
        console.error('Error fetching jokes:', error);
        return [];
    }
}

// Get next available ID for new jokes
export async function getNextJokeId() {
    try {
        const lastJoke = await jokesCollection.findOne({}, { sort: { id: -1 } });
        return lastJoke ? lastJoke.id + 1 : 1;
    } catch (error) {
        console.error('Error getting next joke ID:', error);
        return 1;
    }
}

// Add new joke to database
export async function addJoke(text, author, authorId) {
    try {
        const newJoke = {
            id: await getNextJokeId(),
            text: text,
            author: author,
            authorId: authorId,
            timestamp: Date.now(),
            score: 0,
            upvotes: 0,
            downvotes: 0,
            voters: []
        };
        
        await jokesCollection.insertOne(newJoke);
        return newJoke;
    } catch (error) {
        console.error('Error adding joke:', error);
        throw error;
    }
}

// Update joke score in database
export async function updateJokeScore(jokeId, userId, isUpvote) {
    try {
        const joke = await jokesCollection.findOne({ id: jokeId });
        if (!joke) return null;
        
        // Check if user already voted
        const voterKey = `${userId}_${isUpvote ? 'up' : 'down'}`;
        const oppositeVoterKey = `${userId}_${isUpvote ? 'down' : 'up'}`;
        
        let voters = joke.voters || [];
        let upvotes = joke.upvotes || 0;
        let downvotes = joke.downvotes || 0;
        
        // Remove opposite vote if exists
        if (voters.includes(oppositeVoterKey)) {
            voters = voters.filter(v => v !== oppositeVoterKey);
            if (isUpvote) {
                downvotes = Math.max(0, downvotes - 1);
            } else {
                upvotes = Math.max(0, upvotes - 1);
            }
        }
        
        // Toggle current vote
        if (voters.includes(voterKey)) {
            // Remove vote
            voters = voters.filter(v => v !== voterKey);
            if (isUpvote) {
                upvotes = Math.max(0, upvotes - 1);
            } else {
                downvotes = Math.max(0, downvotes - 1);
            }
        } else {
            // Add vote
            voters.push(voterKey);
            if (isUpvote) {
                upvotes++;
            } else {
                downvotes++;
            }
        }
        
        // Update score
        const score = upvotes - downvotes;
        
        // Update in database
        const updatedJoke = await jokesCollection.findOneAndUpdate(
            { id: jokeId },
            { 
                $set: { 
                    voters: voters,
                    upvotes: upvotes,
                    downvotes: downvotes,
                    score: score
                }
            },
            { returnDocument: 'after' }
        );
        
        return updatedJoke.value;
    } catch (error) {
        console.error('Error updating joke score:', error);
        return null;
    }
}

// Find joke by ID
export async function getJokeById(jokeId) {
    try {
        return await jokesCollection.findOne({ id: jokeId });
    } catch (error) {
        console.error('Error finding joke:', error);
        return null;
    }
}

// Close database connection
export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
} 
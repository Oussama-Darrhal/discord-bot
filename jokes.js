// Import database functions
import { 
    getAllJokes, 
    getNextJokeId, 
    addJoke as addJokeToDb, 
    updateJokeScore as updateJokeScoreInDb,
    getJokeById
} from './database.js';

// Cache for jokes to avoid frequent database calls
let jokesCache = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Get jokes from cache or database
export async function getJokes() {
    const now = Date.now();
    
    // Refresh cache if it's expired or empty
    if (jokesCache.length === 0 || now - lastCacheUpdate > CACHE_DURATION) {
        jokesCache = await getAllJokes();
        lastCacheUpdate = now;
    }
    
    return jokesCache;
}

// Export the getNextJokeId function
export { getNextJokeId };

// Add new joke to database and update cache
export async function addJoke(text, author, authorId) {
    try {
        const newJoke = await addJokeToDb(text, author, authorId);
        
        // Update cache
        jokesCache.push(newJoke);
        
        return newJoke;
    } catch (error) {
        console.error('Error adding joke:', error);
        throw error;
    }
}

// Update joke score in database and cache
export async function updateJokeScore(jokeId, userId, isUpvote) {
    try {
        const updatedJoke = await updateJokeScoreInDb(jokeId, userId, isUpvote);
        
        if (updatedJoke) {
            // Update cache
            const index = jokesCache.findIndex(j => j.id === jokeId);
            if (index !== -1) {
                jokesCache[index] = updatedJoke;
            }
        }
        
        return updatedJoke;
    } catch (error) {
        console.error('Error updating joke score:', error);
        return null;
    }
}

// Find joke by message ID (we'll store this mapping separately)
export const jokeMessageMap = new Map(); // messageId -> jokeId

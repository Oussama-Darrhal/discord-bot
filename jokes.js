// Joke database with metadata
export const jokes = [
    {
        id: 9,
        text: "3lach yonan g3ma ki3rfo i3omo?........... 7yt ighriq",
        author: "System",
        authorId: "system",
        timestamp: Date.now(),
        score: 0,
        upvotes: 0,
        downvotes: 0,
        voters: new Set()
    }
];

// Get next available ID for new jokes
export function getNextJokeId() {
    return Math.max(...jokes.map(j => j.id)) + 1;
}

// Add new joke to database
export function addJoke(text, author, authorId) {
    const newJoke = {
        id: getNextJokeId(),
        text: text,
        author: author,
        authorId: authorId,
        timestamp: Date.now(),
        score: 0,
        upvotes: 0,
        downvotes: 0,
        voters: new Set()
    };
    jokes.push(newJoke);
    return newJoke;
}

// Update joke score
export function updateJokeScore(jokeId, userId, isUpvote) {
    const joke = jokes.find(j => j.id === jokeId);
    if (!joke) return null;
    
    // Check if user already voted
    const voterKey = `${userId}_${isUpvote ? 'up' : 'down'}`;
    const oppositeVoterKey = `${userId}_${isUpvote ? 'down' : 'up'}`;
    
    // Remove opposite vote if exists
    if (joke.voters.has(oppositeVoterKey)) {
        joke.voters.delete(oppositeVoterKey);
        if (isUpvote) {
            joke.downvotes = Math.max(0, joke.downvotes - 1);
        } else {
            joke.upvotes = Math.max(0, joke.upvotes - 1);
        }
    }
    
    // Toggle current vote
    if (joke.voters.has(voterKey)) {
        // Remove vote
        joke.voters.delete(voterKey);
        if (isUpvote) {
            joke.upvotes = Math.max(0, joke.upvotes - 1);
        } else {
            joke.downvotes = Math.max(0, joke.downvotes - 1);
        }
    } else {
        // Add vote
        joke.voters.add(voterKey);
        if (isUpvote) {
            joke.upvotes++;
        } else {
            joke.downvotes++;
        }
    }
    
    // Update score
    joke.score = joke.upvotes - joke.downvotes;
    return joke;
}

// Find joke by message ID (we'll store this mapping separately)
export const jokeMessageMap = new Map(); // messageId -> jokeId

// Joke database with metadata
export const jokes = [
    {
        id: 1,
        text: "galek hada wa7ed n3es m3a 8.... o 7waha",
        author: "System",
        authorId: "system",
        timestamp: Date.now(),
        score: 0,
        upvotes: 0,
        downvotes: 0,
        voters: new Set() // Track who voted to prevent spam
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
        voters: new Set()
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
        voters: new Set()
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
        voters: new Set()
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
        voters: new Set()
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
        voters: new Set()
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
        voters: new Set()
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
        voters: new Set()
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

# Discord Bot with Music and Jokes

A Discord bot that provides joke functionality and YouTube music playback capabilities.

## Features

### Joke System
- `/nukta` - Get a random joke (weighted by score)
- `/submit [joke]` - Submit a new joke
- Voting system with 👍 and 👎 reactions
- Hall of fame jokes (⭐) with score ≥ 10
- Smart joke rotation (avoids repeating recent jokes)

### Music System
- `$play [song name or URL]` - Play music from YouTube
- `$pause` - Pause the current song
- `$resume` - Resume the paused song
- `$skip` - Skip the current song
- `$queue` - Show the current music queue
- `$nowplaying` - Show currently playing song info
- `$leave` - Leave voice channel and clear queue

### Music Features
- YouTube search and direct URL support
- Queue system for multiple songs
- Song information display (title, duration, requester)
- Auto-leave after 5 minutes of inactivity
- Graceful error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Discord bot token:
```
TOKEN=your_discord_bot_token_here
```

3. Run the bot:
```bash
npm start
```

## Requirements

- Node.js 16+ 
- FFmpeg (for music playback)
- Discord bot with appropriate permissions:
  - Send Messages
  - Use Voice Activity
  - Connect to Voice Channels
  - Speak in Voice Channels

## Dependencies

- `discord.js` - Discord API wrapper
- `@discordjs/voice` - Voice connection handling
- `discord-player` - Advanced music player with queue system
- `@discord-player/extractor` - YouTube and other platform extractors
- `ffmpeg-static` - Audio processing
- `opusscript` - Audio encoding (JavaScript implementation)
- `dotenv` - Environment variables

## Usage Examples

**Music Commands:**
```
$play never gonna give you up
$play https://www.youtube.com/watch?v=dQw4w9WgXcQ
$queue
$nowplaying
$skip
$leave
```

**Joke Commands:**
```
/nukta
/submit Why did the chicken cross the road? To get to the other side!
```

## Notes

The bot includes various Arabic response patterns and maintains joke scores with a voting system. Music functionality requires the bot to be in a voice channel and will automatically manage playback queues. 
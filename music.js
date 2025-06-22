import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';

// Global player instance
let player = null;

// Initialize the player
export function initializePlayer(client) {
    player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }
    });

    // Register the reliable YoutubeiExtractor
    player.extractors.register(YoutubeiExtractor, {});

    // Player event listeners
    player.events.on('playerStart', (queue, track) => {
        console.log(`🎵 Started playing: ${track.title}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error('Player error:', error);
    });

    player.events.on('error', (queue, error) => {
        console.error('Queue error:', error);
    });

    player.events.on('playerFinish', (queue, track) => {
        console.log(`✅ Finished playing: ${track.title}`);
    });

    player.events.on('emptyQueue', (queue) => {
        console.log('Queue is empty, starting inactivity timer...');
        startInactivityTimer(queue.guild.id);
    });

    player.events.on('emptyChannel', (queue) => {
        console.log('Voice channel is empty, leaving...');
        queue.delete();
    });

    console.log('✅ Discord Player initialized');
    return player;
}

// Inactivity timers
const inactivityTimers = new Map();

// Start inactivity timer
function startInactivityTimer(guildId) {
    clearInactivityTimer(guildId);
    
    const timer = setTimeout(() => {
        const queue = player?.nodes.get(guildId);
        if (queue) {
            console.log(`Auto-leaving voice channel in guild ${guildId} due to inactivity`);
            queue.delete();
        }
    }, 5 * 60 * 1000); // 5 minutes
    
    inactivityTimers.set(guildId, timer);
}

// Clear inactivity timer
function clearInactivityTimer(guildId) {
    const timer = inactivityTimers.get(guildId);
    if (timer) {
        clearTimeout(timer);
        inactivityTimers.delete(guildId);
    }
}

// Format duration
function formatDuration(duration) {
    if (!duration) return 'Unknown';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Music command handlers
export const musicCommands = {
    async play(message, args) {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) {
            return message.reply('❌ You need to be in a voice channel to play music!');
        }

        if (!args.length) {
            return message.reply('❌ Please provide a song name or YouTube URL! Usage: `$play [song name or URL]`');
        }

        const query = args.join(' ').trim();
        console.log('Search query:', query);
        
        if (!query) {
            return message.reply('❌ Please provide a valid song name or YouTube URL!');
        }

        try {
            // Search for the track
            const searchResult = await player.search(query, {
                requestedBy: message.author,
                searchEngine: 'youtube'
            });

            if (!searchResult || !searchResult.tracks.length) {
                return message.reply('❌ No results found for your search!');
            }

            // Get or create queue
            const queue = player.nodes.create(message.guild, {
                metadata: {
                    voiceChannel: voiceChannel,
                    textChannel: message.channel
                },
                selfDeaf: true,
                volume: 80,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000, // 5 minutes
                leaveOnEnd: false
            });

            // Connect to voice channel if not connected
            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }

            // Clear inactivity timer
            clearInactivityTimer(message.guild.id);

            // Add track(s) to queue
            if (searchResult.playlist) {
                queue.addTrack(searchResult.tracks);
                return message.reply(`✅ **Added playlist:** ${searchResult.playlist.title}\n📝 **${searchResult.tracks.length} songs** added to queue`);
            } else {
                const track = searchResult.tracks[0];
                queue.addTrack(track);

                if (!queue.isPlaying()) {
                    await queue.node.play();
                    return message.reply(`🎵 **Now playing:** ${track.title}\n⏱️ **Duration:** ${formatDuration(track.duration)}\n👤 **Requested by:** ${track.requestedBy}`);
                } else {
                    return message.reply(`✅ **Added to queue:** ${track.title}\n⏱️ **Duration:** ${formatDuration(track.duration)}\n👤 **Requested by:** ${track.requestedBy}\n📝 **Position in queue:** ${queue.tracks.size}`);
                }
            }
        } catch (error) {
            console.error('Play command error:', error);
            return message.reply(`❌ An error occurred while trying to play the song: ${error.message}`);
        }
    },

    async pause(message) {
        const queue = player?.nodes.get(message.guild.id);
        
        if (!queue || !queue.isPlaying()) {
            return message.reply('❌ Nothing is currently playing!');
        }

        queue.node.pause();
        return message.reply('⏸️ **Paused** the current song.');
    },

    async resume(message) {
        const queue = player?.nodes.get(message.guild.id);
        
        if (!queue || !queue.node.isPaused()) {
            return message.reply('❌ Nothing is currently paused!');
        }

        queue.node.resume();
        return message.reply('▶️ **Resumed** the current song.');
    },

    async skip(message) {
        const queue = player?.nodes.get(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            return message.reply('❌ Nothing is currently playing!');
        }

        const skippedTrack = queue.currentTrack.title;
        queue.node.skip();
        
        return message.reply(`⏭️ **Skipped:** ${skippedTrack}`);
    },

    async queue(message) {
        const queue = player?.nodes.get(message.guild.id);
        
        if (!queue || (!queue.currentTrack && queue.tracks.size === 0)) {
            return message.reply('❌ The queue is empty!');
        }

        let queueText = '';
        
        if (queue.currentTrack) {
            queueText += `🎵 **Now Playing:**\n${queue.currentTrack.title} - ${formatDuration(queue.currentTrack.duration)} (Requested by ${queue.currentTrack.requestedBy})\n\n`;
        }

        if (queue.tracks.size > 0) {
            queueText += '📝 **Up Next:**\n';
            const tracks = queue.tracks.toArray().slice(0, 10);
            tracks.forEach((track, index) => {
                queueText += `${index + 1}. ${track.title} - ${formatDuration(track.duration)} (Requested by ${track.requestedBy})\n`;
            });

            if (queue.tracks.size > 10) {
                queueText += `\n... and ${queue.tracks.size - 10} more songs`;
            }
        }

        return message.reply(queueText || '❌ The queue is empty!');
    },

    async nowplaying(message) {
        const queue = player?.nodes.get(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            return message.reply('❌ Nothing is currently playing!');
        }

        const track = queue.currentTrack;
        const progress = queue.node.createProgressBar();
        
        const embed = {
            color: 0x0099ff,
            title: '🎵 Now Playing',
            description: `**${track.title}**`,
            fields: [
                { name: '⏱️ Duration', value: formatDuration(track.duration), inline: true },
                { name: '👤 Requested by', value: track.requestedBy.toString(), inline: true },
                { name: '📊 Status', value: queue.node.isPaused() ? '⏸️ Paused' : '▶️ Playing', inline: true },
                { name: '📈 Progress', value: progress || 'Unknown', inline: false }
            ],
            thumbnail: { url: track.thumbnail },
            timestamp: new Date()
        };

        return message.reply({ embeds: [embed] });
    },

    async leave(message) {
        const queue = player?.nodes.get(message.guild.id);
        
        if (!queue) {
            return message.reply('❌ I\'m not connected to a voice channel!');
        }

        queue.delete();
        clearInactivityTimer(message.guild.id);
        return message.reply('👋 **Left** the voice channel and cleared the queue.');
    }
}; 
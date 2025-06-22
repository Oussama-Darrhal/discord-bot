import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';

// Simple test to verify the extractor works
async function testMusicSearch() {
    console.log('🧪 Testing music search functionality...');
    
    // Create a minimal client mock for testing
    const mockClient = {
        user: { id: 'test' },
        options: {},
        ws: { ping: 50 }
    };
    
    try {
        const player = new Player(mockClient, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }
        });
        
        // Register the extractor
        player.extractors.register(YoutubeiExtractor, {});
        console.log('✅ Extractor registered successfully');
        
        // Test search
        const searchResult = await player.search('test song', {
            requestedBy: { id: 'test', username: 'testuser' },
            searchEngine: 'youtube'
        });
        
        console.log('🔍 Search completed');
        console.log('Results found:', searchResult.tracks.length);
        
        if (searchResult.tracks.length > 0) {
            console.log('✅ First result:', searchResult.tracks[0].title);
            console.log('🎉 Music search is working correctly!');
        } else {
            console.log('❌ No results found - search may not be working');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMusicSearch();
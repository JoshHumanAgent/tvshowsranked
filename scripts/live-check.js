const https = require('https');

// Get live site HTML
https.get('https://dynamicrankengine.com/', (res) => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
        // Check the actual structure
        console.log('=== LIVE SITE ANALYSIS ===');
        console.log('');
        console.log('HTML size:', html.length, 'bytes');
        
        // Look for the rankings div
        const rankingsMatch = html.match(/id="rankings"[^>]*>([^<]*)</);
        if (rankingsMatch) {
            console.log('rankings div content:', rankingsMatch[1] || '(empty)');
        }
        
        // Check for show-module divs (rendered shows)
        const showModules = (html.match(/class="show-module"/g) || []).length;
        console.log('show-module elements:', showModules);
        
        // Check if loadShowsData exists
        const hasLoadShows = html.includes('async function loadShowsData()');
        console.log('loadShowsData function:', hasLoadShows);
        
        // Check Firebase initialization
        const hasFirebase = html.includes('initializeApp');
        console.log('Firebase init:', hasFirebase);
        
        // Check for onAuthStateChanged
        const hasAuthState = html.includes('onAuthStateChanged');
        console.log('onAuthStateChanged:', hasAuthState);
        
        // Check for double semicolon bug
        const hasDoubleSemi = html.includes('];;');
        console.log('');
        console.log('Double semicolon bug:', hasDoubleSemi ? 'PRESENT - BUG!' : 'FIXED');
    });
}).on('error', e => console.log('ERROR:', e.message));

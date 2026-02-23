const https = require('https');

https.get('https://dynamicrankengine.com/', (res) => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
        // Find show-card examples
        const matches = html.match(/show-card[^>]*>[\s\S]{0,500}/g) || [];
        console.log('Found', matches.length, 'show-card snippets');
        console.log('');
        
        if (matches.length > 0) {
            console.log('First 3 show-card snippets:');
            matches.slice(0, 3).forEach((m, i) => {
                console.log('---');
                console.log((i+1) + '.', m.substring(0, 300));
            });
        }
        
        // Check if shows are inside a container
        console.log('');
        console.log('=== CHECKING CONTAINERS ===');
        const hasMainContent = html.includes('id="main"') || html.includes('class="main"');
        console.log('main container:', hasMainContent);
        
        const hasShowsContainer = html.includes('shows-container');
        console.log('shows-container:', hasShowsContainer);
        
        // Check for shows-array
        const hasShowsArray = html.includes('shows =') || html.includes('shows=[]');
        console.log('shows array init:', hasShowsArray);
    });
}).on('error', e => console.log('ERROR:', e.message));

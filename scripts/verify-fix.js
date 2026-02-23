const https = require('https');

https.get('https://dynamicrankengine.com/', (res) => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
        // Check for BOTH fixes
        const hasCoercion = html.includes('typeof show.final');
        console.log('Type coercion fix deployed:', hasCoercion);
        
        // Check the exact line location
        if (hasCoercion) {
            const idx = html.indexOf('typeof show.final');
            console.log('');
            console.log('Fix context:');
            console.log(html.substring(idx - 20, idx + 80));
        }
        
        // Check if JSON is fixed
        https.get('https://dynamicrankengine.com/data/shows/index.json', (res2) => {
            let data = '';
            res2.on('data', c => data += c);
            res2.on('end', () => {
                const json = JSON.parse(data);
                const stringFinals = json.shows.filter(s => typeof s.final === 'string');
                console.log('');
                console.log('String finals in JSON:', stringFinals.length);
            });
        });
    });
}).on('error', e => console.log('ERROR:', e.message));

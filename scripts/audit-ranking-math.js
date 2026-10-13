/** Read-only audit. Never writes the catalogue or protected foundation ratings. */
const fs = require('node:fs');
const path = require('node:path');
const math = require('../ranking-math');

function auditRankingMath(root = path.resolve(__dirname, '..')) {
    const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'data/shows/index.json'), 'utf8').replace(/^\uFEFF/, ''));
    const differences = [], errors = [];
    for (const show of catalogue.shows) {
        try {
            const withBonus = math.calculateFinal(show, math.DEFAULT_WEIGHTS, true);
            const withoutBonus = math.calculateFinal(show, math.DEFAULT_WEIGHTS, false);
            if (show.final !== withBonus) differences.push({ title: show.title, stored: show.final, withBonus, withoutBonus });
        } catch (error) {
            errors.push({ title: show.title, error: error.message });
        }
    }
    return { total: catalogue.shows.length, validInputs: catalogue.shows.length - errors.length,
        weights: math.DEFAULT_WEIGHTS, storedFinalDifferences: differences.length,
        note: 'The browser calculates totals from category inputs and current settings. Stored finals are historical catalogue values and are not used as calculation inputs.',
        errors, differences };
}

if (require.main === module) {
    const result = auditRankingMath();
    console.log(JSON.stringify(process.argv.includes('--json') ? result : { ...result, differences: result.differences.slice(0, 8) }, null, 2));
    process.exitCode = result.errors.length ? 1 : 0;
}
module.exports = { auditRankingMath };

/** Read-only validation using the same math as the running website. */
const { runHealthCheck } = require('./health-check');
const { auditRankingMath } = require('./audit-ranking-math');
const { auditSite } = require('./audit-site');

const health = runHealthCheck();
let rankingMath;
try {
    rankingMath = auditRankingMath();
} catch (error) {
    rankingMath = { errors: [{ error: error.message }] };
}
let site;
try { site = auditSite(); } catch (error) { site = { errors:[error.message] }; }
const status = health.status === 'HEALTHY' && !rankingMath.errors.length && !site.errors.length ? 'HEALTHY' : 'UNHEALTHY';
console.log(JSON.stringify({ status, health, site, rankingMath: {
    ...rankingMath,
    differences: rankingMath.differences?.slice(0, 8)
} }, null, 2));
process.exitCode = status === 'HEALTHY' ? 0 : 1;

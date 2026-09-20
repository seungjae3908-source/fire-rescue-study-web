import fs from 'node:fs';
import path from 'node:path';
import { collectOfficialNotices } from './official-monitor-lib.mjs';

const idx = process.argv.indexOf('--output');
const output = idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : 'v9/data/official-monitor.json';
const snapshot = await collectOfficialNotices(fetch, new Date());

console.log('OFFICIAL_MONITOR_SYNC_SUMMARY', JSON.stringify({
  generatedAt: snapshot.generatedAt,
  healthy: snapshot.healthy,
  sources: snapshot.sourceStatus,
  items: snapshot.items.length,
  targetYear: snapshot.items.filter(x => x.targetYearMatch).length,
  reviewRequired: snapshot.items.filter(x => x.reviewRequired).length
}, null, 2));

if (!snapshot.healthy) {
  console.error('OFFICIAL_MONITOR_SYNC_UNHEALTHY');
  process.exit(2);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(snapshot, null, 2) + '\n');
console.log('OFFICIAL_MONITOR_SYNC_COMPLETE', output);

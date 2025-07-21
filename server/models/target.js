// server/models/targets.js
const fs   = require('fs');
const path = require('path');
const dir  = path.join(__dirname, '../data/targets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const fileFor = (userId) => path.join(dir, `${userId}.json`);

exports.getTargets = (userId = 'default') => {
  try { return JSON.parse(fs.readFileSync(fileFor(userId))); }
  catch { return {}; }
};

exports.saveTargets = (userId = 'default', targets = {}) => {
  fs.writeFileSync(fileFor(userId), JSON.stringify(targets, null, 2));
  return targets;
};

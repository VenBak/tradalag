/* server/scripts/sector-breakdown.js
   ----------------------------------------------------------
   1)  CLI mode:  node sector-breakdown.js            (prints report)
   2)  Lib mode:  const getAlloc = require('./sector-breakdown');
                  const { grandTotal, perSectorUSD } = getAlloc();
*/

const xlsx = require('xlsx');
const path = require('path');

const SECTORS = [
  'Basic Materials','Consumer Discretionary','Consumer Staples','Energy',
  'Financials','Health Care','Industrials','Real Estate','Technology',
  'Telecommunications','Utilities'
];

function getSectorAllocation() {
  const file = path.join(__dirname, '../../nbim-data-dumpy.xls');
  const wb   = xlsx.readFile(file);
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });

  let grandTotal = 0;
  const perSectorUSD = Object.fromEntries(SECTORS.map(s => [s, 0]));

  rows.forEach(r => {
    const usdVal = Number(r.usd) || 0;
    grandTotal  += usdVal;

    const sec = (r.sector || '').trim() || 'Unknown';
    if (!perSectorUSD.hasOwnProperty(sec)) perSectorUSD[sec] = 0;
    perSectorUSD[sec] += usdVal;
  });

  return { grandTotal, perSectorUSD };
}

/* ---------- CLI ---------- */
if (require.main === module) {
  const { grandTotal, perSectorUSD } = getSectorAllocation();
  console.log('\n=== Sector Allocation (USD) ===\n');
  console.log(`Total portfolio value: $${grandTotal.toLocaleString()}\n`);
  Object.entries(perSectorUSD).forEach(([sec, val]) => {
    const pct = grandTotal ? (val / grandTotal) * 100 : 0;
    console.log(`${sec.padEnd(25)}  $${val.toLocaleString().padStart(15)}   ${pct.toFixed(2)}%`);
  });
}

module.exports = getSectorAllocation;

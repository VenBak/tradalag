// server/routes/portfolio.js
const express = require('express');
const router  = express.Router();
const getAlloc             = require('../scripts/sector-breakdown');
const { getTargets, saveTargets } = require('../models/targets');

// GET  /api/portfolio/sector-allocation
router.get('/sector-allocation', (req, res) => {
  const { grandTotal, perSectorUSD } = getAlloc();
  const allocation = Object.entries(perSectorUSD).map(([sector, usdValue]) => ({
    sector,
    usdValue,
    pct: grandTotal ? (usdValue / grandTotal) * 100 : 0
  }));
  const targets = getTargets(req.user?.id);
  res.json({ allocation, targets });
});

// PUT  /api/portfolio/sector-targets   { targets: { Technology: 25, Energy: 8, ... } }
router.put('/sector-targets', (req, res) => {
  const saved = saveTargets(req.user?.id, req.body.targets || {});
  res.json({ ok: true, targets: saved });
});

module.exports = router;

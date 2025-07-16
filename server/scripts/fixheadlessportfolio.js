require('dotenv').config();
const mongoose = require('mongoose');
const { Profile } = require('../models');
const { Types } = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tradalag');

  const profiles = await Profile.find({ "portfolio._id": { $exists: false } });
  console.log(`Found ${profiles.length} profiles with headless stocks…`);

  for (const p of profiles) {
    let changed = false;
    p.portfolio = p.portfolio.map(entry => {
      if (!entry._id) {
        changed = true;
        return { ...entry.toObject(), _id: new Types.ObjectId() };
      }
      return entry;
    });
    if (changed) await p.save();
  }

  console.log('Done.');
  process.exit(0);
})();

const { AuthenticationError } = require('apollo-server-express');
const { Profile } = require('../models');
const { signToken } = require('../utils/auth');
const { Types } = require('mongoose');

const resolvers = {
  Query: {
    profiles: async () => {
      return Profile.find();
    },

    profile: async (parent, { profileId }) => {
      return Profile.findOne({ _id: profileId });
    },

    me: async (_p, _args, context) => {
      if (!context.profile) return null;          // not logged-in
      // re-query so we always have the latest apiKey, etc.
      return Profile.findById(context.profile._id);
    },

    portfolioTotalValue: async (_parent, { stockId }, context) => {
      if (!context.profile) throw new AuthenticationError('Must be logged in');
      const profile = await Profile.findById(context.profile._id).lean();
      const total = profile.portfolio.reduce((sum, lot) => sum + (lot.valueUSD || 0), 0);
      return total;
    }
  },

  Mutation: {
    addProfile: async (parent, { username, password }) => {
      const profile = await Profile.create({ username, password });
      const token = signToken(profile);

      return { token, profile };
    },
    login: async (parent, { username, password }) => {
      const profile = await Profile.findOne({ username });

      if (!profile) {
        throw new AuthenticationError('Error: wrong email or password');
      }

      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Error: wrong email or password');
      }

      const token = signToken(profile);
      return { token, profile };
    },

    removeProfile: async (parent, { profileId }) => {
      return Profile.findOneAndDelete({ _id: profileId });
    },

    setApiKey: async (_p, { apiKey }, context) => {
      if (!context.profile) throw new AuthenticationError('Must be logged in');
      return await Profile.findByIdAndUpdate(
        context.profile._id,
        { apiKey },
        { new: true }
      );
    },

    clearApiKey: async (_p, _args, context) => {
      if (!context.profile) throw new AuthenticationError('Must be logged in');
      return await Profile.findByIdAndUpdate(
        context.profile._id,
        { $unset: { apiKey: 1 } },
        { new: true }
      );
    },

    addStock: async (_parent, args, context) => {
      if (!context.profile) throw new AuthenticationError('Login required');

      // ensure numbers & timestamp
      const entry = {
        _id:        new Types.ObjectId(),              // gives client a stable _id
        ticker:     args.ticker,
        name:       args.name,
        sector:     args.sector,
        shares:     Number(args.shares),
        valueUSD:   Number(args.valueUSD),
        recordedAt: args.recordedAt ? new Date(args.recordedAt) : new Date(),
      };

      // push into embedded array and return the pushed sub-doc
      const updated = await Profile.findByIdAndUpdate(
        context.profile._id,
        { $push: { portfolio: entry } },
        { new: true, runValidators: true }
      );

      return updated.portfolio.id(entry._id); // mongoose sub-doc lookup
    },

    /* ───────────────── removeStock ───────────────── */
    removeStock: async (_parent, { stockId }, context) => {
      if (!context.profile) throw new AuthenticationError('Login required');

      const updated = await Profile.findByIdAndUpdate(
        context.profile._id,
        { $pull: { portfolio: { _id: stockId } } },
        { new: true }
      );

      // return the removed id so client can optimistically update if desired
      return stockId;
    },
    setTargetSectorPercentages: async (_p, { totalAmountUSD, percentages }, context) => {
      if (!context.profile) throw new AuthenticationError('Must be logged in');
      if (percentages.length !== 11)
        throw new Error('Exactly 11 percentages required');
      const sum = percentages.reduce((t, n) => t + n, 0);
      if (Math.abs(sum - 100) > 0.01)
        throw new Error(`Percentages must add to 100 % (got ${sum})`);
      return await Profile.findByIdAndUpdate(
        context.profile._id,
        { targetSectorPercentages: percentages, targetTotalUSD: totalAmountUSD },
        { new: true },
      );
    },
  }
};

module.exports = resolvers;
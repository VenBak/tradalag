const { AuthenticationError } = require('apollo-server-express');
const { Profile } = require('../models');
const { signToken } = require('../utils/auth');

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
  }
};

module.exports = resolvers;
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type PortfolioEntry {
    _id: ID!
    ticker: String!
    name: String!
    sector: String!
    shares: Int!
    valueUSD: Float!
    recordedAt: String
  }
  type Profile {
    _id: ID
    username: String
    # There is now a field to store the user's password
    password: String
    apiKey: String
    portfolio: [PortfolioEntry!]!
    targetSectorPercentages: [Float!]!
    targetTotalUSD: Float
    portfolioTotal: Float!
  }

  # Set up an Auth type to handle returning data from a profile creating or user login
  type Auth {
    token: ID!
    profile: Profile
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile
    portfolioTotalValue: Float!
  }

  type Mutation {
    # Set up mutations to handle creating a profile or logging into a profile and return Auth type
    addProfile(username: String!, password: String!): Auth
    login(username: String!, password: String!): Auth

    removeProfile(profileId: ID!): Profile
    setApiKey(apiKey: String!): Profile!
    clearApiKey: Profile!

    addStock(
    ticker: String!
    name:   String!
    sector: String!
    shares: Int!
    valueUSD: Float!
    recordedAt: String
    ): PortfolioEntry!
    removeStock(stockId: ID!): ID!
    setTargetSectorPercentages(
      totalAmountUSD: Float!
      percentages: [Float!]!
    ): Profile!
  }
`;

module.exports = typeDefs;
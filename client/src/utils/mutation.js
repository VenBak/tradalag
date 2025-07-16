import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      profile {
        _id
        username
      }
    }
  }
`;

export const ADD_PROFILE = gql`
  mutation AddProfile($username: String!, $password: String!) {
    addProfile(username: $username, password: $password) {
      token
      profile {
        _id
        username
      }
    }
  }
`;

export const SET_API_KEY = gql`
  mutation SetApiKey($apiKey: String!) {
    setApiKey(apiKey: $apiKey) { _id apiKey }
  }
`;

export const CLEAR_API_KEY = gql`
  mutation ClearApiKey {
    clearApiKey { _id apiKey }
  }
`;

export const ADD_STOCK = gql`
  mutation AddStock(
    $ticker: String!, $name: String!, $sector: String!,
    $shares: Int!, $valueUSD: Float!
  ) {
    addStock(
      ticker: $ticker, name: $name, sector: $sector,
      shares: $shares, valueUSD: $valueUSD
    ) {
      _id ticker name sector shares valueUSD
    }
  }
`;

export const REMOVE_STOCK = gql`
  mutation RemoveStock($stockId: ID!) {
    removeStock(stockId: $stockId)
  }
`;

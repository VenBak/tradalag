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
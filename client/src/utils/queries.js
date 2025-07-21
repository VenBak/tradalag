import { gql } from '@apollo/client';

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      username
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      username
    }
  }
`;

export const GET_ME = gql`
  { me { _id username apiKey portfolio {
      _id ticker name sector shares valueUSD
  } targetSectorPercentages
      targetTotalUSD } }
`;
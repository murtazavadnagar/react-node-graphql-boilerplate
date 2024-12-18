import { gql } from "@apollo/client";

export const FETCH_POSTS = gql`
  query posts($page: Int!, $limit: Int!, $filter: String!) {
    posts(page: $page, limit: $limit, filter: $filter) {
      posts {
        id
        title
        body
        timeToRead
        createdAt
        userId
      }
      postsCount
    }
  }
`;

export const FETCH_USERS = gql`
  query users {
    users {
      id
      name
      company {
        name
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($id: Int!) {
    deletePost(id: $id)
  }
`;

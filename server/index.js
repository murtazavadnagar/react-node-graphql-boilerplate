import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";

import { getPosts } from "./controller/posts.js";
import { getUsers } from "./controller/users.js";
import { randomDate, getRandomDelay } from "./utils/collections.js";

const app = express();

const typeDefs = `
  type Post {
    id: Int
    title: String
    body: String
    timeToRead: Int
    createdAt: String
    userId: Int
  }

  type PostsResponse {
    posts: [Post]
    postsCount: Int
  }

  type Company {
    name: String
  }

  type User {
    id: Int
    name: String
    company: Company
  }

  type Query {
    posts(page: Int, limit: Int, filter: String): PostsResponse
    users: [User]
  }

  type Mutation {
    deletePost(id: Int!): Boolean
  }
`;

const resolvers = {
  Query: {
    posts: async (_, { page, limit, filter }) => {
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
      const response = await getPosts(page, limit, filter);
      const postsList = response.paginatedPosts.map((post) => ({
        ...post,
        timeToRead: Math.ceil(post.body.length / 60),
        createdAt: randomDate(
          new Date(2020, 0, 1),
          new Date(),
          0,
          24
        ).toISOString(),
      }));
      const data = {
        posts: postsList,
        postsCount: response.postsCount,
      };
      return data;
    },

    users: async () => {
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
      const response = await getUsers();
      return response;
    },
  },

  Mutation: {
    deletePost: async (_, { id }) => {
      // console.log("id", id);
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
      return Math.random() < 0.5;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use("/graphql", cors(), express.json(), expressMiddleware(server));

app.listen(5000, () =>
  console.log("Server is running on http://localhost:5000")
);

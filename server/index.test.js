const request = require("supertest");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const { getPosts } = require("./controller/posts");
const { getUsers } = require("./controller/users");
const { randomDate, getRandomDelay } = require("./utils/collections");
const cors = require("cors");

// Mock functions for controllers and utils
jest.mock("./controller/posts", () => ({
  getPosts: jest.fn(),
}));

jest.mock("./controller/users", () => ({
  getUsers: jest.fn(),
}));

jest.mock("./utils/collections", () => ({
  randomDate: jest.fn(),
  getRandomDelay: jest.fn(),
}));

// Test suite for GraphQL server
describe("GraphQL Server", () => {
  let app;
  let server;

  beforeAll(async () => {
    // Setup the Apollo server with the same schema and resolvers
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
          await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
          return Math.random() < 0.5;
        },
      },
    };

    server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    app = express();
    app.use("/graphql", cors(), express.json(), expressMiddleware(server));
  });

  // afterAll(async () => {
  //   // Close the server after all tests are done
  //   await server.close();
  // });

  it("should fetch posts correctly", async () => {
    // Mocking data
    getPosts.mockResolvedValue({
      paginatedPosts: [
        {
          id: 1,
          title: "Post Title 1",
          body: "This is a sample post body.",
          userId: 1,
        },
        {
          id: 2,
          title: "Post Title 2",
          body: "This is a sample post body.",
          userId: 1,
        },
      ],
      postsCount: 3,
    });

    randomDate.mockReturnValue(new Date()); // Mock randomDate

    const query = `
      query {
        posts(page: 1, limit: 2, filter: "") {
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

    const response = await request(app)
      .post("/graphql")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data.posts.posts).toHaveLength(2);
    expect(response.body.data.posts.posts[0]).toHaveProperty("timeToRead");
    expect(response.body.data.posts.posts[0]).toHaveProperty("createdAt");
    expect(response.body.data.posts.postsCount).toBe(3);
  });

  it("should fetch users correctly", async () => {
    // Mocking data
    getUsers.mockResolvedValue([
      { id: 1, name: "User 1", company: { name: "Company 1" } },
    ]);

    const query = `
      query {
        users {
          id
          name
          company {
            name
          }
        }
      }
    `;

    const response = await request(app)
      .post("/graphql")
      .send({ query })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data.users).toHaveLength(1);
    expect(response.body.data.users[0]).toHaveProperty("name", "User 1");
    expect(response.body.data.users[0].company).toHaveProperty(
      "name",
      "Company 1"
    );
  });

  it("should delete a post", async () => {
    const mutation = `
      mutation {
        deletePost(id: 1)
      }
    `;

    const response = await request(app)
      .post("/graphql")
      .send({ query: mutation })
      .set("Content-Type", "application/json");

    expect.extend({
      toBeBooleanOrNull(received) {
        return typeof received === "boolean"
          ? {
              message: () => `expected ${received} to be boolean`,
              pass: true,
            }
          : {
              message: () => `expected ${received} to be boolean`,
              pass: false,
            };
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.data.deletePost).toBeDefined();
    expect(response.body.data.deletePost).toBeBooleanOrNull();
  });
});

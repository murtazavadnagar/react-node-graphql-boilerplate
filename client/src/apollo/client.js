import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:5000/graphql",
  cache: new InMemoryCache(),
  connectToDevTools: true,
  request: (operation) => {
    console.log(operation);
  },
});

export default client;

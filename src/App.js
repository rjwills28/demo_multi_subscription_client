import './App.css';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { gql } from "graphql-tag";


const COMMENTS_SUBSCRIPTION = gql`
  subscription ($id: ID!) {
    getValue(id: $id)
  }
`;


const httpLink = new HttpLink({
  uri: 'http://localhost:8080/ws'
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:8080/ws',
}));

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});


function App() {
  let count = 0;
  for (let i = 0; i < 100; i++){
    count = count + 1;
    client
        .subscribe({
          query: COMMENTS_SUBSCRIPTION,
          variables: { id: i }
        });
  }
  return <p>Subscribing to {count}</p>;
}

export default App;

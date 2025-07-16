import logo from './logo.svg';
import './App.css';
import Home from './pages/Home'
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import Minmax from './pages/Home';
import LoginPopup from './pages/LoginPopup';
import Portfolio from './pages/Portfolio';

const httpLink = createHttpLink({
  uri: 'graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// const client = new ApolloClient({
//   uri: 'https://flyby-router-demo.herokuapp.com/',
//   cache: new InMemoryCache(),
// });
// const client = new ApolloClient({
//   uri: process.env.REACT_APP_GRAPHQL_URI || '/graphql',
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// });


const client = new ApolloClient({
  link: authLink.concat(httpLink),   // ← make sure this line’s in place
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
        <Route
          path="/portfolio"
          element={<Portfolio />}
        />
        <Route
          path="/signup"
          element={<LoginPopup />}
        /> 
        </Routes>
       </Router>
    </ApolloProvider>
  )
}

export default App;

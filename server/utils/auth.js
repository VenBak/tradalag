const jwt = require('jsonwebtoken');
require('dotenv').config();

// module.exports = {
//   signToken: function ({ username, _id }) {
//     const payload = { username, _id };
//     return jwt.sign({ data: payload }, process.env.SECRET, { expiresIn: process.env.EXPIRATION });
//   },
// };

const secret = process.env.JWT_SECRET;      // <—
const expiration = process.env.EXPIRATION || '2h';

module.exports = {
authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // We split the token string into an array and return actual token
    if (req.headers.authorization) {
        token = token.split(' ').pop().trim();
    }

    if (!token) {
        // console.log("no token")
        return req;
        
    }

    // if token can be verified, add the decoded user's data to the request so it can be accessed in the resolver
    try {
        const { data } = jwt.verify(token, secret, { maxAge: expiration});
        req.profile = data;
    } catch {
        console.log('Invalid token');
    }

    // return the request object so it can be passed to the resolver as `context`
    return req;
    },
  signToken: function ({ email, name, _id }) {
    const payload = { email, name, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
const auth = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Middleware to authenticate the request using Basic Auth.
exports.authenticateUser = async (req, res, next) => {

    // variable to add message to if any errors occur below
    let message;

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    // If the user's credentials are available...
    if (credentials) {
        // Attempt to retrieve the user from the data store
        // by their emailAddress (i.e. the user's "key" from the Authorization header).
        const user = await User.findOne({ where: { emailAddress: credentials.name } });

        // If a user was successfully retrieved from the data store...
        if (user) {
            // Use the bcrypt npm package to compare the user's password
            // (from the Authorization header) to the user's password
            // that was retrieved from the data store.
            const authenticated = bcrypt.compareSync(credentials.pass, user.password);

            // If the passwords match...
            if (authenticated) {
                // Store the retrieved user object on the request object
                // so any middleware functions that follow this middleware function
                // will have access to the user's information.
                req.currentUser = user;
            } else {
                message = `Authentication failed for ${user.emailAddress}`;
            }
        } else {
            message = `User not found for ${credentials.name}`;
        }
    } else {
        message = `Auth header not found`;
    }

    // If user authentication failed...
    if (message) {
        // Return a response with a 401 Unauthorized HTTP status code.
        console.warn(message);
        res.status(401).json({ message: `Access Denied` });
    } else {
        // Or if user authentication succeeded...
        // Call the next() method.
        next();
    }
};


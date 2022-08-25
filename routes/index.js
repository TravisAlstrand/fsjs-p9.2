const express = require('express');
const router = express.Router();
// const { asyncHandler, authenticateUser } = require('../middleware')
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateUser } = require('../middleware/authenticateUser');

/* ========== USER ROUTES ========== */

// A /api/users GET route that will return all properties and values for the currently authenticated User along with a 200 HTTP status code.
router.get('/users', authenticateUser, asyncHandler( async (req, res) => {
    console.log(req.currentUser);
}));

// A /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/users', asyncHandler( async (req, res) => {

}));

/* ========== COURSE ROUTES ========== */

// A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/courses', asyncHandler( async (req, res) => {

}));

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler( async (req, res) => {

}));

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', asyncHandler( async (req, res) => {

}));

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', asyncHandler( async (req, res) => {

}));

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', asyncHandler( async (req, res) => {

}));

module.exports = router;
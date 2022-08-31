const express = require('express');
const router = express.Router();
const { User, Course } = require('../models');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateUser } = require('../middleware/authenticateUser');

/* ========== USER ROUTES ========== */

// A /api/users GET route that will return all properties and values for the currently authenticated User along with a 200 HTTP status code.
router.get('/users', authenticateUser, asyncHandler( async (req, res) => {

    // variable for user object sent back from authenticateUser
    const user = req.currentUser;

    if (user) {
        // set status and parse only these 3 properties of user 
        res.status(200).json({
            "firstName": user.firstName,
            "lastName": user.lastName,
            "emailAddress": user.emailAddress
        });
    } else {
        throw new Error;
    }
}));

// A /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/users', asyncHandler( async (req, res) => {
    try {
        // wait to create new user using info from request body
        await User.create(req.body);
        // set location header to '/', set status to 201, end process 
        res.setHeader('Location', '/')
            .status(201)
            .end();
    } catch(error) {
        // if error is a validation or unique error from models
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            // map over errors and get the error message
            const errors = error.errors.map(err => err.message);
            // set status to 400 and print error messages
            res.status(400).json({ errors });
        } else {
            // if error is not a validation or unique from models throw new error
            throw error;
        }
    };
}));

/* ========== COURSE ROUTES ========== */

// A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/courses', asyncHandler( async (req, res) => {

    // wait for all courses to be found and include course creator objects
    const allCourses = await Course.findAll({
        include: {
            model: User,
            as: 'courseCreator',
            attributes: ['firstName', 'lastName', 'emailAddress']
        }
    });

    // create new array, exclude 'created at / updated at' properties
    const courses = allCourses.map( ({ id, title, description, estimatedTime, materialsNeeded, userId, courseCreator}) => {
        return { id, title, description, estimatedTime, materialsNeeded, userId, courseCreator};
    });

    // set status and parse courses to json
    res.status(200).json(courses);
}));

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler( async (req, res, next) => {

    // wait for specific course to be found and include course creator object
    const course = await Course.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'courseCreator',
            attributes: ['firstName', 'lastName', 'emailAddress']
        }
    });

    // if a course was found...
    if (course) {
        // set status and parse course to json excluding 'created at / updated at'
        res.status(200).json({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "estimatedTime": course.estimatedTime,
            "materialsNeeded": course.materialsNeeded,
            "userId": course.userId,
            "courseCreator": course.courseCreator
        });
    } else {
        // if no course was found, set status to 404 and push to error handlers with 'next'
        res.status(404);
        next();
    }
}));

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {

    try {
        // wait to create a new course
        const newCourse = await Course.create(req.body);
        
        // set status and location header
        res.status(201).setHeader('Location', `/courses/${newCourse.id}`).end();
    } catch(error) {
        // if error is a validation or unique error from models
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {

            // map over errors and get the error message
            const errors = error.errors.map(err => err.message);

            // set status to 400 and print error messages
            res.status(400).json({ errors });
        } else {
            // if error is not a validation or unique from models throw new error
            throw error;
        }
    }
}));

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {

    try {
        // wait for specific course to be found
        const course = await Course.findByPk(req.params.id);

        // if a course was found...
        if (course) {

            // if the authed user is the creator of the course...
            if (req.currentUser.id === course.userId) {

                // wait to update the course in db
                // if successful, set status and end
                await course.update(req.body);
                res.status(204).end();
            } else {
                // if not correct user, set status and send message
                res.status(403).json({message: "You don't have access to update this course"});
            }
        } else {
            // if course was not found send 404 and message
            res.status(404).json({message: "The course was not found"})
        }
    } catch(error) {
        // if error was a Sequelize Validation Error...
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {

    // wait to find specific course
    const course = await Course.findByPk(req.params.id);

    // if a course was found...
    if (course) {

        // if the authed user is the creator of the course...
        if (req.currentUser.id === course.userId) {

            // wait to delete course from db
            await course.destroy();
            
            // set status and end
            res.status(204).end();
        } else {
            // if authed user does not own course...
            // set status and send message
            res.status(403).json({message: "You do not have access to delete this course"});
        }
    } else {
        // if course was not found send 404 and message
        res.status(404).json({message: "The course was not found"})
    }
}));

module.exports = router;
'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const router = require('./routes/index');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// parse requests to json
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// use the routes from the routes/index.js file
app.use('/api', router);

// set up a database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db'
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to database was successful!')
  }).catch((err) => {
    console.error('Connection to database was unsuccessful!', err);
  });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

sequelize.sync()
  .then(() => {
    console.log("All models were synchronized successfully.");
  }).catch(err => {
    console.error('Model synchronization was unsuccessful!', err);
  })


// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});


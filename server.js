const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models.js');

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;
const server = express();

// allow server to parse JSON bodies from POST/PUT/DELETE requests
server.use(bodyParser.json());

server.get('/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) throw err;
    res.json(data);
  });
});

server.get('/users/:id', (req, res) => {
  const id = req.params.id;
  User.findById(id, (err, data) => {
    if (err) {
      res.json({
        error: 'The User youa are trying to find could not be found :('
      });
      return;
    }
    res.json(data);
  });
});

server.post('/users', (req, res) => {
  const { firstName, lastName } = req.body;
  const user = new User({
    firstName,
    lastName,
    userName: `${req.body.firstName}${req.body.lastName}${Math.floor((Math.random()) * 100)}`,
  });
  if (!firstName) {
    res.status(422);
    res.json({
      error: 'Missing first name. Please enter the users first name.'
    });
    return;
  }
  if (!lastName) {
    res.status(422);
    res.json({
      error: 'Missing last name. Please enter the users last name.'
    });
    return;
  }
  user.save((err) => {
    if (err) throw err;
    res.json(`New User: ${firstName} ${lastName}, was succesfully created!`);
  });
});

server.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  User.findByIdAndRemove(id, (err) => {
    if (err) {
      res.status(422);
      res.json({ 'Error deleting user': err.message });
      return;
    }
    res.json('User deleted');
    return;
  });
});

server.put('/users/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  User.findByIdAndUpdate(id, { "name": name }, () => {
    User.findById(id)
      .exec((err, userUpdated) => {
        if (err) {
          es.status(422);
          res.json({ 'Error updating user': err.message });
          return;
        }
        res.json(userUpdated);
      });
  });
});

mongoose.Promise = global.Promise;

const connect = mongoose.connect(
  'mongodb://localhost/users', {
    useMongoClient: true
  }
);

/* eslint no-console: 0 */
connect.then(() => {
  const port = 3000;
  server.listen(port);
  console.log(`Server Listening on ${port}`);
}, (err) => {
  console.log('\n************************');
  console.log("ERROR: Couldn't connect to MongoDB. Do you have it running?");
  console.log('************************\n');
});
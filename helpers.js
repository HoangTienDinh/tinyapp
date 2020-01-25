const express = require("express");
const bcrypt = require('bcrypt');
const moment = require('moment');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const randomString = require('randomstring')
const PORT = 8080
const app = express();
const generateRandomString = randomString.generate(6);
const urlDatabase = { };
const users = { };

const emailLookup = (email, u) => {
  for (let id in u) {
    const user = u[id];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const loginCheck = (email, password) => {
  const user = emailLookup(email, users);
  if (user && bcrypt.compareSync(password, user.hashedPassword)) {
    return user;
  }
  return false;
}

const urlLookup = (user_id, database) => {
  const userUrls = {};
  for (let key in database) {
    const url_id = database[key].user_id;
    if (user_id === url_id) {
      userUrls[key] = database[key];
    }
  }
  return userUrls;
}

module.exports = {
  urlDatabase,
  users,
  emailLookup,
  loginCheck,
  urlLookup,
  moment,
  morgan,
  bodyParser,
  cookieSession,
  PORT,
  app,
  generateRandomString,
  bcrypt
}
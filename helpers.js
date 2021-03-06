//function will show if short url exists
const bcrypt = require('bcryptjs');
const verifyShortUrl = (URL, database) => {
  return database[URL];
};

//Implementing a Random ShortURL function(Reference:https://pretagteam.com/question/random-text-generator-js)
function generateRandomString() {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = lowerCase.toUpperCase();
  const numeric = '1234567890';
  const alphaNumeric = lowerCase + upperCase + numeric;
  let index = Math.round(Math.random() * 100);
  if (index > 61) {
    while (index > 61) {
      index = Math.round(Math.random() * 100);
    }
  }
  return alphaNumeric[index];
};

// Function will generate a unique url, string random alphaNumeric values
const randomString = () => {
  let randomString = '';
  while (randomString.length < 6) {
    randomString += generateRandomString();
  }
  return randomString;
};


//Function to check if emails are registered before
const checkIfAvail = (newVal, database) => {
  for (let user in database) {
    if (database[user].email === newVal) {
      return false;
    }
  }
  return true;
};

//Function to check if user id is available
const addUser = (newUser, database) => {
  const newUserId = randomString();
  newUser.id = newUserId;
  newUser.password = bcrypt.hashSync(newUser.password, 10);
  database[newUserId] = newUser;
  return newUser;
};

const fetchUserInfo = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};

const getUserByEmail = (cookie, database) => {
  for (let ids in database) {
    if (cookie === ids) {
      return database[ids].email;
    }
  }
};

//Return url where the userID is equal to the id of current user
const urlsForUser = (id, database) => {
  let getUserByEmailId = id;
  let usersURLs = {};
  for (let key in database) {
    if (database[key].userID === getUserByEmailId) {
      usersURLs[key] = database[key];
    }
  }
  return usersURLs;
};
const checkOwner = (userId, urlID, database) => {
  return userId === database[urlID].userID;
};


module.exports = {verifyShortUrl, randomString, getUserByEmail , checkIfAvail, addUser, fetchUserInfo, urlsForUser, checkOwner};
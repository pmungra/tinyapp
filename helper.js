//function will show if short url exists
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
    randomString += generateRandomString
  }
  return randomString;
};


//Function to check if emails are registered before
const checkIfAvail = (newVal, database) => {
  for (user in database) {
    if (database[user]['email-address'] === newVal) {
      return false;
    }
  }
  return true;
}

//Function to check if user id is available
const addUser = (newUser, database) => {
  const newUserId = randomString();
  newUser.id = newUserId;
  userDatabase[newUserId] = newUser;
  return newUser;
}

const fetchUserInfo = (email, database) => {
  for (key in database) {
    if (database[key]['email-address'] === email) {
      return database[key]
    }
  }
}



module.exports = { verifyShortUrl, randomString, checkIfAvail, addUser, fetchUserInfo } 
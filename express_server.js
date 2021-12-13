//Installing and Setting Up EJS
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
const bodyParser = require("body-parser");
const cookie = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookie());

//Redirect Short URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Createing a users Object
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Adding Route for /urls  to displayed on the main page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
//  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Adding GET Route to Show the Form (new url is created)
//Adding an endpoint to handle a POST to /login in your Express server
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies['user_id']}
  res.render("urls_new", templateVars);
});

// Redirecting to new Page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL)) {
    let longURL = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL: shortURL, longURL: longURL, user_id: req.cookies['user_id']
  };
    res.render("urls_show", templateVars);
  } else {
    res.send('does not exist');
  }
});

// Adding POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateShortURL();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);
});


// Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send('Page does not exist');
  }
});

//Delete: Routing on Server ==>Add a POST route that removes a URL resource: POST /urls/:shortURL/delete ===>redirect the client back to the urls_index page ("/urls")
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});

//Edit: Add a POST route that updates a URL resource; POST /urls/edit
app.post("/urls/:shortURL/edit", (req, res) => {
  const edit = req.params.shortURL;
  urlDatabase[edit] = req.body.longURL;
  res.redirect(`/urls`)
});

// endpoint user login
app.post("/login", (req, res) => {
  if (userDatabase[req.body.user_id]) {
    const user_id = req.body.user_id;
    res.cookie('user_id', user_id);
  
  res.status(400).send(`It's us not you, please try after sometime`)
});

// endpoint user logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Registration form
app.get("/register", (req, res) => {
  templateVars = { user_id:req.cookies['user_id']}
  res.render("urls_register", templateVars);

})

//Adding user if available
const addUser = newUser => {
  const newUserId = generateShortURL();
  newUser.id = newUserId
  userDatabase[newUserId] = newUser;
  return newUser
}

//To check if emails are registered
const checkIfAvail = (newVal, database) => {
  for (user in database) {
    if (!user[newVal]) {
      return null;
    }
  }
  return true;
}

//To check if email is already registered
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    res.status(400).send('Email is required');
  } else if (password === '') {
    res.status(400).send('Password is required');
  } else if (!checkIfAvail(email, userDatabase)) {
    res.status(400), send('This email is already registered')
  }
  newUser = addUser(req.body)
  res.cookie('user_id', newUser.id)
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



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

// function will generate a unique url, string random alphaNumeric values
const generateShortURL = () => {
  let randomString = '';
  while (randomString.length < 6) {
    randomString += generateRandomString();
  }
  return randomString;
} ;

//function will show if short url exists
const verifyShortUrl = URL => {
  return urlDatabase[URL];
}; 
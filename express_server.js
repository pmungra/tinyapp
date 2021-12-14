//Installing and Setting Up EJS
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

//The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['userid']
}));
app.use(morgan('dev'));

const {verifyShortUrl, randomString, checkIfAvail, addUser, fetchUserInfo, getUserByEmail, urlsForUser, checkOwner} = require('./helpers');

//Redirect Short URLs
const urlDatabase = {
 // "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "part1"},
  //"9sm5xK": {longURL: "http://www.google.com", userID: "part2"},
};

//Createing a users Object
const userDatabase = {
 // "part1": {id: "part1", "email-address":"parthpmungra@gmail.com", password: "parthpmungra"}
};

app.get("/", (req, res) => {
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (!user) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
}});
 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*Adding Route for /urls  to displayed on the main page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, current_user: getUserByEmail(req.cookies['user_id']) };
  res.render("urls_index", templateVars);
//  res.send("<html><body>Hello <b>World</b></body></html>\n");
});*/

// Registration form
app.get("/register", (req, res) => {
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (user) {
    res.redirect('/urls');
  } else {
    let templateVars = { getUserByEmail: user };
    res.render("urls_register", templateVars);
}});

//To check if email is already registered
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    res.status(400).send('Email is required');
  } else if (password === '') {
    res.status(400).send('Password is required');
  } else if (!checkIfAvail(email, userDatabase)) {
    res.status(400).send('This email is already registered');
  } else { 
  const newUser = addUser(req.body, userDatabase);
  req.session.userId = newUser.id;
  res.redirect('/urls');
}});

app.get("/login", (req, res) => {
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = { getUserByEmail: user };
    res.render("login", templateVars);
}});

//Created helper to verify user id and passward matches database
app.post("/login", (req, res) => {
  const emailUsed = req.body['email'];
  const pwdUsed = req.body['password'];
  if (fetchUserInfo(emailUsed, userDatabase)) {
    const { password, id } = fetchUserInfo(emailUsed, userDatabase);
  if (!bcrypt.compareSync(pwdUsed, password)) {
    res.status(403).send('Error 403... re-enter your password');
  } else {
    req.session.userId = id;
    res.redirect('/urls');
  }
  } else {
    res.status(403).send('Error 403... email not found');
}});

//urls are displayed on the main page
app.get("/urls", (req, res) => {
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (!user) {
    res.render("urls_errors");
  } else {
    const usersLinks = urlsForUser(user, urlDatabase);
    let templateVars = { urls: usersLinks, getUserByEmail: getUserByEmail(req.session.userId, userDatabase) };
    res.render("urls_index", templateVars);
}});

// Adding POST Route to Receive the Form Submission
//To add new url to all urls page
app.post("/urls", (req, res) => {
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (!user) {
    res.redirect("/login");
  } else {
    const shortURL = randomString();
    const newURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: newURL, userID: user };
    res.redirect(`/urls/${shortURL}`);
}});

// new url key is created
app.get("/urls/new", (req, res) => {
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (!user) {
    res.redirect('/login');
  } else {
    let templateVars = { getUserByEmail: user };
    res.render("urls_new", templateVars);
}});

// Redirecting to new Page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = getUserByEmail(req.session.userId, userDatabase);
  if (verifyShortUrl(shortURL, urlDatabase)) {
    if (user !== urlDatabase[shortURL].userID) {
      res.send('This id does not belong to you');
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    let templateVars = { shortURL: shortURL, longURL: longURL, getUserByEmail: user};
    res.render("urls_show", templateVars);
  }
} else {
  res.send('This url does not exist');
}});

// Redirecting to longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('Does not exist');
}});

//Delete: Routing on Server ==>Add a POST route that removes a URL resource: POST /urls/:shortURL/delete ===>redirect the client back to the urls_index page ("/urls")
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!checkOwner(getUserByEmail(req.session.userId, userDatabase), req.params.shortURL, urlDatabase)) {
    res.send('This id does not belong to you');
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
}});

//Edit: Add a POST route that updates a URL resource; POST /urls/edit
app.post("/urls/:shortURL/edit", (req, res) => {
  if (!checkOwner(getUserByEmail(req.session.userId, userDatabase), req.params.shortURL, urlDatabase)) {
    res.send('This id does not belong to you');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
}});

// endpoint user logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
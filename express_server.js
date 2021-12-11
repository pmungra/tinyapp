//Installing and Setting Up EJS
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//Redirect Short URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
//  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Adding GET Route to Show the Form (new url is created)
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Redirecting to new Page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL)) {
    let longURL = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL: shortURL, longURL: longURL };
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
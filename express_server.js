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


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase.shortURL };
  res.render("urls_show", templateVars);
});

// Adding POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateShortURL();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const randomstring = require('randomstring');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

let generateRandomString = () => {
  return randomstring.generate(6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls/:shortURL/delete", (req, res) => {  // Delete the url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// app.post("/urls/logout", (req, res) => {
//   res.clearCookie('username');
//   res.redirect("/urls");
// });

app.post("/urls/:id", (req, res) => { // redirects to the edit page
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/login", (req, res) => { // redirects to main page after login

  res.redirect("/login")
})

app.post("/register", (req, res) => { // redirects to main page after registering
  res.redirect("/register")
})

app.post("/urls", (req, res) => { // generates a random string for the webpage that was typed in
  let newString = generateRandomString();
  urlDatabase[newString] = req.body.longURL;
  res.redirect(`/urls/${newString}`);
});

app.get("/urls/new", (req, res) => { 
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => { // renders the urls_login.ejs
  res.render("urls_login");
});

app.get("/register", (req, res) => { // renders the urls_register.ejs
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


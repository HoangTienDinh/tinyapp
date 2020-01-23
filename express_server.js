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

const users = {

};

app.post("/urls/:shortURL/delete", (req, res) => {  // Delete the url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('UID');
  res.redirect("/urls");
});

// redirects to the edit page
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

// redirects to main page after login
app.post("/login", (req, res) => {

  for (let x in users) {
    if (users[x].email === req.body.email) {
      res.cookie("UID", users[x].id)
    } 
  }

  res.redirect("/urls")
})

// redirects to main page after registering
app.post("/register", (req, res) => {
  let uniqueID = generateRandomString();
    users[uniqueID] = {
        id: uniqueID,
        email: req.body["email"],
        password: req.body["password"]
    };
  res.cookie("UID", uniqueID);
  res.redirect("/urls")
})

// generates a random string for the webpage that was typed in
app.post("/urls", (req, res) => {
  let newString = generateRandomString();
  urlDatabase[newString] = req.body.longURL;
  res.redirect(`/urls/${newString}`);
});

app.get("/urls/new", (req, res) => { 
  const { UID } = req.cookies
  let templateVars = {
    email: users[UID]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const { UID } = req.cookies
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: users[UID]
  };
  res.render("urls_show", templateVars);
});

// renders the urls_login.ejs, and gets the login page
app.get("/login", (req, res) => { 
  const { UID } = req.cookies
  let templateVars = {
    email: users[UID]
  }
  res.render("urls_login", templateVars);
});

// renders the urls_register.ejs, and gets the register page
app.get("/register", (req, res) => { 
  const { UID } = req.cookies
  let templateVars = {
    email: users[UID]
  }
  res.render("urls_register", templateVars) ;
});

app.get("/urls", (req, res) => {
  const { UID } = req.cookies
  let templateVars = {
    urls: urlDatabase,
    email: users[UID]
  };
  // console.log(users[UID].email)
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


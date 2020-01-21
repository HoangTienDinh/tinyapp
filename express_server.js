const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const randomstring = require('randomstring');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

function generateRandomString() {
  return randomstring.generate(6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newString = generateRandomString();
  urlDatabase[newString] = req.body.longURL;
  res.redirect(`/urls/${newString}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log("We are in the route")
  const longURL = urlDatabase[req.params.shortURL]
  console.log("test ",longURL);
  res.redirect(longURL);
})
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
  user1: {
    email: "hoho@mail.com",
    password: "1234"
  }
};

const emailLookup = function(data, input) {
  for (let key in data) {
    if (data[key].email === input) {
      return true;
    }
  }
  return false;
}

const passwordLookup = function(data, input) {
  for (let key in data) {
    if (data[key].password === input) {
      return true;
    }
  }
  return false;
}

const userIDLookup = function(data, input) {
  for (let key in data) {
    if (data[key].id === input) {
      return true;
    }
  }
  return false;
}

// allows for posts to be deleted
app.post("/urls/:shortURL/delete", (req, res) => {  // Delete the url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// posts for the logout button and redirects
app.post("/logout", (req, res) => {
  res.clearCookie('UID');
  res.redirect("/urls");
});

// redirects to the edit page
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// redirects to main page after login
app.post("/login", (req, res) => {
  if (!emailLookup(users, req.body["email"])) {
    res.sendStatus(403);
  } else if (!passwordLookup(users, req.body["password"])) {
    res.sendStatus(403);
  } else {
    for (let x in users) {
      if (users[x].email === req.body["email"]) {
        res.cookie("UID", users[x].id)
      }
    }
  res.redirect("/urls")
  }
})

// redirects to main page after registering
app.post("/register", (req, res) => {
  if (emailLookup(users, req.body["email"])) {
    res.sendStatus(400);
  }
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
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userID = req.cookies.UID
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  }
  res.redirect(`/urls/${shortURL}`);
});


// <<<<<<<<<<<<<ALL THE app.get IS BELOW HERE>>>>>>>>>>>>>>>>>

// renders the urls_new
app.get("/urls/new", (req, res) => { 

  if (userIDLookup(users, req.cookies.UID)) {
    const { UID } = req.cookies
    let templateVars = {
      urls: urlDatabase,
      email: users[UID]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls")
  }
  
});

// renders the urls_show 
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

// renders the urls_index
app.get("/urls", (req, res) => {
  let userUrls = {};

  for (let key in urlDatabase) {
    let userID = urlDatabase[key].userID
    if (req.cookies.UID === userID) {
      userUrls[key] = urlDatabase[key]
    }
  }

  const { UID } = req.cookies
  let templateVars = {
    urls: userUrls,
    email: users[UID]
  };
  res.render("urls_index", templateVars);
});

// redirects to the edit page
app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.statusCode(400)
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// redirects to the main page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

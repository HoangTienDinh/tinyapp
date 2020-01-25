const {  urlDatabase, users, emailLookup, loginCheck, urlLookup,  moment, morgan, bodyParser, cookieSession, PORT, app, generateRandomString, bcrypt } = require('./helpers.js');
app.set('view engine', 'ejs');
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

// ALL MIDDLEWARE
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieSession({
  name: 'session',
  keys: ['key'],
  maxAge: 24 * 60 * 60 * 1000 // lasts for 24 hours
}));

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new", { user });
});

// Checks for urls and if valid users are logged in
app.get("/urls/:shortUrl", (req, res) => {
  const user = users[req.session.user_id]
  const shortUrl = req.params.shortUrl;
  if (!user) {
    res.sendStatus(400);
    return;
  }
  if (!urlDatabase[shortUrl] || (urlDatabase[shortUrl].user_id !== user.id)) {
    res.sendStatus(404);
    return;
  }
  const templateVars  = {
    ...urlDatabase[shortUrl],
    user,
  };
  res.render("urls_show", templateVars);
});
app.post('/urls/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const user_id = req.session.user_id
  if (!urlDatabase[shortUrl]) {
    res.sendStatus(404);
    return;
  }
  if (user_id !== urlDatabase[shortUrl].user_id) {
    res.sendStatus(403);    
    return;
  }
  urlDatabase[shortUrl].longUrl = req.body.longUrl;
  res.redirect(`/urls/`)
})

app.get("/u/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl
  const urlObj = urlDatabase[shortUrl];
  if (!urlObj) {
    res.sendStatus(404);
    return;
  }

  const longUrl = urlObj.longUrl;
  res.redirect(longUrl);
})

// Allows for new users and checks if that email is used yet.
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  res.render('register', { user });
});
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const registeredAlready = Boolean(emailLookup(email, users));
  if (registeredAlready) {
    res.sendStatus(400);
    return;
  }
  const id = generateRandomString;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, hashedPassword };
  req.session.user_id = id;
  res.redirect('/urls');
});

// Checks to see valid emails/passwords
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  res.render('login', { user });
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!(email || password)) {
    res.sendStatus(403);
    return;
  }
  const user = loginCheck(email, password)
  if (!user) {
    res.sendStatus(403);
    return;
  }
  req.session.user_id = user.id
  res.redirect('/urls');
});

// Displays urls
app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect('/login')
  }
  const usersUrls = urlLookup(user.id, urlDatabase);
  const templateVars = {
    usersUrls,
    shortenUrlRoute: '/urls/new',
    user,
  };
  res.render('urls_index', templateVars);
});
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }
  const id = generateRandomString;
  urlDatabase[id] = {
    longUrl: req.body.longUrl,
    user_id,
    id,
    time: moment(),
  }
  res.redirect(`urls/${id}`);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.redirect('/login');
});

// Deletes url
app.post('/urls/:shortUrl/delete', (req, res) => {
  const { shortUrl } = req.params;
  const user_id = req.session.user_id
  if (user_id !== urlDatabase[shortUrl].user_id) {
    res.sendStatus(403);
    return;
  }
  delete urlDatabase[shortUrl];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.user_id = false;
  res.redirect('/urls/new');
});
const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

// App config and middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1"]
}));


// ~ Test databases ~
const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userId: "userRandomID" },
  '9sm5xK': { longURL: 'http://www.google.com', userId: "userRandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "aaa@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "bbb@example.com",
    password: "12345"
  }
};


// ~ Get routing ~
app.get("/register", (req, res) => {
  // Check if logged in
  const user = users[req.session.userId];
  if (user) return res.redirect("/urls");

  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.url, user };
  res.render("registration", templateVars);
});


app.get("/login", (req, res) => {
  // Check if logged in
  const user = users[req.session.userId];
  if (user) return res.redirect("/urls");

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render("login", templateVars);
});


// User dashboard
app.get("/urls", (req, res) => {
   // Check if logged in
  const user = users[req.session.userId];
  if (!user) return res.redirect("/login");

  const usersURLs = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: usersURLs, user };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
   // Check if logged in
  const user = users[req.session.userId];
  if (!user) return res.sendStatus(401);

  const templateVars = { user };
  res.render("urls_new", templateVars);
});


// Short url edit page
app.get("/urls/:shortURL", (req, res) => {
   // Check if logged in
  const user = users[req.session.userId];
  if (!user) return res.sendStatus(401);
  
  // Check permissions
  const shortURL = req.params.shortURL;
  if (user.id !== urlDatabase[shortURL].userId) return res.sendStatus(403);

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };
  res.render("urls_show", templateVars);
});


// Short url redirection
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]?.longURL;
  res.redirect(longURL);
});



// ~ Posts routing ~
app.post("/register", (req, res) => {
  // Check input fields
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Check input fields");

  // Check if already registered
  const user = getUserByEmail(email, users);
  if (user) return res.status(400).send("Account already exists");
  
  // Add new user to database
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password);
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };

  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  // Check input fields
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) return res.sendStatus(400);

  // Check permissions
  const user = getUserByEmail(email, users);
  if (!user) return res.status(400).send("Invalid Password or Email");
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).send("Invalid Password or Email");

  // User logged in
  req.session.userId = user.id;
  res.redirect("/urls");
});


// New short url
app.post("/urls", (req, res) => {
 // Check if logged in
  const user = users[req.session.userId];
  if (!user) return res.sendStatus(401);

  // Add new url to database
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: user.id };
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  // Check if logged in
  const user = users[req.session.userId];
  if (!user) return res.sendStatus(401);

  // Check permissions
  const shortURL = req.params.shortURL;
  if (user.id !== urlDatabase[shortURL].userId) return res.sendStatus(403);

  // Delete url from database
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


// Edit short url
app.post("/urls/:id", (req, res) => {
   // Check if logged in
  const user = users[req.session.userId];
  if (!user) return res.sendStatus(401);

  // Check permissions
  const shortURL = req.params.id;
  if (user.id !== urlDatabase[shortURL].userId) return res.sendStatus(403);

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


// ~ Run server ~
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

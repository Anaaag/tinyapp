const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require("./helpers")


app.set("view engine", "ejs");

app.use(cookieSession({
  name: "session",
  keys: ["key1"]
}))

function generateRandomString() {
  return Math.random().toString(23).slice(8)
}

const urlsForUser = function(id) {
 const usersURLs = {};
 for (const key in urlDatabase) {
 if (urlDatabase[key].userId === id) {
   usersURLs[key] = urlDatabase[key];
   console.log(usersURLs);
 }
 }
  return usersURLs;
}

const urlDatabase = {
 
  'b2xVn2':  { longURL: 'http://www.lighthouselabs.ca', userId: "userRandomID"},

  '9sm5xK': { longURL: 'http://www.google.com', userId: "userRandomID"}
}


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

}




const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}));

//first route to update 
app.get("/urls", (req, res) => {
  const user = users[req.session.userId]
  if (!user) return res.redirect("/login")
  const usersURLs = urlsForUser(user.id)
  const templateVars = { urls: usersURLs,  user};
  res.render("urls_index", templateVars);
});

//third route to update
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userId]
  if (!user) return res.sendStatus(401)
  const templateVars = { user};
  res.render("urls_new", templateVars);
});


//second route to update
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userId]
  if (!user) return res.sendStatus(401)
  const shortURL = req.params.shortURL
  if (user.id !== urlDatabase[shortURL].userId) return res.sendStatus(403)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,  user};
  console.log(req.session["user"]); 
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  const user = users[req.session.userId]
  if (!user) return res.sendStatus(401)
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = {longURL: req.body.longURL, userId: user.id} 
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`)        
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]?.longURL
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.userId]
  if (!user) return res.sendStatus(401)
  const shortURL = req.params.shortURL
  if (user.id !== urlDatabase[shortURL].userId) return res.sendStatus(403)
  delete urlDatabase[shortURL] 
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.userId]
  if (!user) return res.sendStatus(401)
  const shortURL = req.params.id;
  if (user.id !== urlDatabase[shortURL].userId) return res.sendStatus(403)
  urlDatabase[shortURL].longURL = req.body.longURL
  res.redirect("/urls")
})

//LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email || !password) {
    return res.sendStatus(400)
  }
  if (!user) return res.status(400).send("Invalid Login")
    
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).send("Invalid Password")

  
  
  req.session.userId = userId[getUserByEmail(email, users)].id;
  res.redirect("/urls");
})

app.get("/login", (req, res) => {
  const user = users[req.session.userId]
  if (user) return res.redirect("/urls")
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user}
  res.render("login", templateVars);
})


//LOGOUT
app.post("/logout", (req, res) => {
  
  res.session = null;
  res.redirect("/login");
});

//REGISTER
app.get("/register", (req, res) => {
  const user = users[req.session.userId]
  if (user) return res.redirect("/urls")
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.url, user};
res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(req.body.password)
  console.log(email, password, req.body)
  if (!email || !password) {
     return res.status(400).send("Error")
  } 
  const user = getUserByEmail(email)

  if (user) {
    return res.status(400).send("Account already exists")
  }

  const userId = generateRandomString(); 
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  }
  req.session.userId = userId;
  console.log(users);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

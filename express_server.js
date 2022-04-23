const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser())

function generateRandomString() {
  return Math.random().toString(23).slice(8)
}

const getUserByEmail =function(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id]
    }
    
  }
  return null;
}

const urlDatabase = {
 
  'b2xVn2':  {
    longURL: 'http://www.lighthouselabs.ca'
  },

  '9sm5xK': {
    longURL: 'http://www.google.com' 
}
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "aaa@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "userRandomID",
    email: "bbb@example.com",
    password: "12345"
  }

}




const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}));

//first route to update 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,  user: req.cookies ? users[req.cookies.userId] : null};
  res.render("urls_index", templateVars);
});

//third route to update
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies ? users[req.cookies.userId] : " " };
  res.render("urls_new", templateVars);
});


//second route to update
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user: req.cookies ? users[req.cookies.userId] : " " };
  console.log(req.cookies["user"]); 
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  console.log(req.body);  
  res.redirect(`/urls/${shortURL}`)        
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL] 
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  console.log(req.params)
  console.log(req.params.id)
  console.log(urlDatabase[req.params.id])
  res.redirect("/urls")
})

//LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!email || !password) {
    return res.sendStatus(400)
  }
  if (!user) return res.status(400).send("Invalid Login")
    
  if (password !== user.password) return res.status(400).send("Invalid Login")

  
  res.cookie("userId", user.id);
  res.redirect("/urls");
})

app.get("/login", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user: req.cookies ? users[req.cookies.userId] : " " }
  res.render("login", templateVars);
})


//LOGOUT
app.post("/logout", (req, res) => {
  
  res.clearCookie("userId");
  res.redirect("/login");
});

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.url, user: req.cookies ? req.cookies.userId : "" };
res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
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
    password: password
  }
  res.cookie("userId", userId);
  console.log(users);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

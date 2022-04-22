const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser())

function generateRandomString() {
  return Math.random().toString(23).slice(8)
}


const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: '123' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '345' }
};


const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}));

//first route to update 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,  username: req.cookies["username"],};
  res.render("urls_index", templateVars);
});

//third route to update
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//second route to update
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  username: req.cookies["username"] };
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
  const username = req.body.username
  res.cookie("username", username)
  res.redirect("/urls")
})
//LOGOUT
// app.post("/logout", (req, res) => {
 
//   res.clearCookie(username)
//   res.redirect("/urls")
// })


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

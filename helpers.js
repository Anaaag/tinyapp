const getUserByEmail = function(email, users) {
  for (let id in users) {
    if (users[id].email === email) return users[id];
  }
  return null;
};

function generateRandomString() {
  return Math.random().toString(23).slice(8);
};

const urlsForUser = function(id, urlDatabase) {
  const usersURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      usersURLs[key] = urlDatabase[key];
    }
  }
  return usersURLs;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
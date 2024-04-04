const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

let userList = [];

// this function will create new uuid then check for uuid duplicate
// if there are duplicate repeat the function
// if there is none return the uuid.
function createUserId() {
  let uuid = crypto.randomUUID();

  if (userList.length <= 0) {
    return uuid;
  }

  for (let i = 0; i < userList.length; i++) {
    if (userList[i]["_id"] === uuid) {
      createUserId();
    }

    return uuid;
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const name = req.body.username.toString();
  const userId = createUserId();
  const user = { username: name, _id: userId };
  userList.push(user);

  res.json({ username: name, _id: userId });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

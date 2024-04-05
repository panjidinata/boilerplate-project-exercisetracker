const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

let userList = [];

function createUserId() {
  let uuid = crypto.randomUUID();

  // check for uuid duplicate and generate new uuid if exist
  while (userList.some((user) => user._id === uuid)) {
    uuid = crypto.randomUUID();
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

app.get("/api/users", (req, res) => {
  res.json(userList);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

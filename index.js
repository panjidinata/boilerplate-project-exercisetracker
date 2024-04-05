const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

let userList = [];

let exercisesList = {};

function createUserId() {
  let uuid = crypto.randomUUID();

  // check for uuid duplicate and generate new uuid if exist
  while (userList.some((user) => user._id === uuid)) {
    uuid = crypto.randomUUID();
  }

  return uuid;
}

function getUsername(id) {
  const user = userList.find((user) => user._id === id);
  return user ? user.username : null;
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

app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  let user = getUsername(id);

  if (user === null) {
    console.log("error: user %s doesn't exist", req.params._id);
  }

  const date =
    req.body.date === undefined || req.body.date === ""
      ? new Date().toDateString()
      : new Date(req.body.date).toDateString();

  const exercises = {
    description: req.body.description,
    duration: req.body.duration,
    date: new Date(date).toDateString(),
  };

  if (Object.hasOwn(exercisesList, id)) {
    exercisesList[id].push(exercises);
  } else {
    exercisesList[id] = [exercises];
  }

  res.json({
    _id: id,
    username: user,
    description: exercises.description,
    duration: Number(exercises.duration),
    date: exercises.date,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

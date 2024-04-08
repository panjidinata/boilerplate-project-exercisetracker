const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

//userlist = [{username: test1, id: 123}, {username: test2, id:1234}]
let userList = [];

//exercisesList = {
//                  id1: [{desc: xxx, dur: xxx, date: xxx},{desc: xxx, dur: xxx, date: xxx}],
//                  id2: [{desc: xxx, dur: xxx, date: xxx}]
//                }
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

function getExercises(id) {
  return new Map(Object.entries(exercisesList)).get(id);
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
  let username = getUsername(id);

  if (username === null) {
    console.log("error: user %s doesn't exist", req.params._id);
  }

  const date =
    req.body.date === undefined || req.body.date === ""
      ? new Date().toDateString()
      : new Date(req.body.date.toString()).toDateString();

  const exercises = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: new Date(date).toDateString(),
  };

  if (Object.hasOwn(exercisesList, id)) {
    exercisesList[id].push(exercises);
  } else {
    exercisesList[id] = [exercises];
  }

  res.json({
    _id: id,
    username: username,
    description: exercises.description,
    duration: exercises.duration,
    date: exercises.date,
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id;
  const username = getUsername(id);
  let exercises = getExercises(id);
  const from =
    req.query.from === undefined || req.query.from === ""
      ? undefined
      : new Date(req.query.from.toString()).getTime();
  const to =
    req.query.to === undefined || req.query.to === ""
      ? undefined
      : new Date(req.query.to.toString()).getTime();
  const limit = req.query.limit;

  if (from && to) {
    exercises = exercises.filter((logs) => {
      let convertDate = new Date(Date.parse(logs.date)).getTime();
      return convertDate >= from && convertDate <= to;
    });
  }

  if (limit) {
    exercises = exercises.slice(0, parseInt(limit));
  }

  res.json({
    username: username,
    _id: id,
    count: exercises.length,
    log: exercises,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

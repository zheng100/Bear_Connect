const router = require("express").Router();
const axios = require("axios");
var ObjectId = require("mongodb").ObjectID;
let Group = require("../models/groupModel");
let User = require("../models/userModel");

// CREATE
router.route("/add").post((req, res) => {
  const members = req.body.members;
  const open = req.body.open;
  const sizeLimit = Number(req.body.sizeLimit);
  const className = req.body.className;

  function getDiscord() {
    return axios
      .post("http://host.docker.internal:5003/create_channel") //depends on docker config
      .then((response) => {
        this.response = response.data;
        return this.response;
      });
  }

  getDiscord().then((data) => {
    discordLink = data.channel_invite;
    discordID = data.channel_id;
    console.log(discordLink);

    const newGroup = new Group({
      members,
      open,
      sizeLimit,
      className,
      discordLink,
    });

    newGroup
      .save()
      .then(() => res.send({ discordLink: discordLink, discordID: discordID }))
      .catch((err) => res.status(400).json("Error: " + err));
  });
});

router.route("/addWithoutLink").post((req, res) => {
  const members = req.body.members;
  const open = req.body.open;
  const sizeLimit = Number(req.body.sizeLimit);
  const className = req.body.className;
  const discordLink = req.body.discordLink;

  const newGroup = new Group({
    members,
    open,
    sizeLimit,
    className,
    discordLink,
  });

  newGroup
    .save()
    .then(() => res.json("Group added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

// READ
router.route("/").get((req, res) => {
  Group.find()
    .then((groups) => res.json(groups))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").get((req, res) => {
  Group.findById(req.params.id)
    .then((group) => res.json(group))
    .catch((err) => res.status(400).json("Error: " + err));
});

// UPDATE
router.route("/:id").put((req, res) => {
  Group.findById(req.params.id)
    .then((group) => {
      group.members = req.body.members;
      group.open = req.body.open;
      group.sizeLimit = Number(req.body.sizeLimit);
      group.className = req.body.className;

      group
        .save()
        .then(() => res.json("Group updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// Add user to group
router.route("/addUser/:id").put((req, res) => {
  Group.findById(req.params.id)
    .then((group) => {
      if (group.open == false) {
        res.json("Sorry, this group is full.");
      } else {
        if (group.open) {
          group.members.push(req.body.user);
        }
        if (group.members.length == group.sizeLimit) {
          group.open = false;
        }
        group
          .save()
          .then(() => res.json({ discordLink: group.discordLink }))
          .catch((err) => res.status(400).json("Error: " + err));
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// DELETE
router.route("/:id").delete((req, res) => {
  Group.findByIdAndDelete(req.params.id)
    .then(() => res.json("Group deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Best groups
router.route("/bestGroups/:id").get(async (req, res) => {
  const user = await User.findById(req.params.id);
  const groups = await Group.find({
    className: user.selectedClass,
    open: true,
  });

  let groupData = [];
  groups.forEach((group) => {
    groupProps = {
      _id: null,
      names: [],
      years: [],
      majors: [],
      meetingTimes: [],
      studyTimes: [],
      studyStyles: [],
    };
    group.members.forEach((member) => {
      groupProps["names"].push(member.name);
      groupProps["years"].push(member.year);
      groupProps["majors"].push(member.major);
      groupProps["meetingTimes"].push(member.meetingTimes);
      groupProps["studyTimes"].push(member.studyTimes);
      groupProps["studyStyles"].push(member.studyStyle);
    });
    groupProps["_id"] = group._id;
    groupData.push(groupProps);
    groupProps = {
      years: [],
      majors: [],
      meetingTimes: [],
      studyTimes: [],
      studyStyles: [],
    };
  });

  let ranks = {};
  let w = { 1: 3, 2: 1, 3: 1, 4: 1, 5: 1 };
  let yearToInt = {
    freshman: 1,
    sophomore: 2,
    junior: 3,
    senior: 4,
    "master's": 5,
    phd: 6,
  };
  groupData.forEach((group) => {
    let [
      yearFeature,
      majorFeature,
      meetingTimesFeature,
      studyTimesFeature,
      studyStyleFeature,
    ] = Array(5).fill(0);

    yearNums = group.years.map((x) => yearToInt[x]);
    let avgYear = Object.values(yearNums).reduce((a, b) => a + b) / 2;

    if (Math.abs(avgYear - yearToInt[user.year]) <= 1) {
      yearFeature = 1;
    }
    if (group.majors.includes(user.major)) {
      majorFeature = 1;
    }
    if (group.meetingTimes.includes(user.meetingTimes)) {
      meetingTimesFeature = 1;
    }
    if (group.studyTimes.includes(user.studyTimes)) {
      studyTimesFeature = 1;
    }
    if (group.studyStyles.includes(user.studyStyle)) {
      studyStyleFeature = 1;
    }

    let score = w[1] * yearFeature + w[2] * majorFeature + w[3] * meetingTimesFeature + w[4] * studyTimesFeature + w[5] * studyStyleFeature;
    ranks[group._id] = score;

  });

  var sortable = [];
  for (var r in ranks) {
    sortable.push([r, ranks[r]]);
  }
  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  bestGroups = [];
  sortable.forEach((pair) => {
    groups.forEach((group) => {
      if (group._id == pair[0]) {
        bestGroups.push(group);
      }
    });
  });

  res.json(bestGroups.slice(1, 3));
});

// router.route("/test").get(async (req, res) => {
//   const ids = req.body.ids;
//   users = [];
//   for (let i = 0; i < ids.length; i++) {
//     const userData = await User.findById(ids[i]);
//     users.push(userData);
//   }
//   res.json(users);
// });

module.exports = router;

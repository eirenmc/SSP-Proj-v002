// Requiring node modules
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Variables that will be used later to store the username and password of 
// the account that has been created.
var username = "";
var password = "";

// An Array that will hold all the projects and their contents
var allProjects = [];

/////////////////////////////////////////////////////////////////////////////////////////////////
// MongoDB
// I am requiring mongoDB and client so I can establish a database and connection so secrets can
// be stored in the database
var mongoClient = require('mongodb').MongoClient;

// This is a variable that will either run the database from the set environment variables I have
// set online or local host address
var url = process.env.CUSTOMCONNSTR_portfolioBuilderEiren || 'mongodb://localhost:27017/mongoDBAssignment02';

/////////////////////////////////////////////////////////////////////////////////////////////////

/* GET home page. */
router.get('/', function (req, res, next) {
  //res.render('index', { project: docs });
});

/* Renders the create portfolio piece page if button clicked */
router.get('/projectEntry', function (req, res, next) {
  if (username.length == 0) {
    res.render('loginAccount', { title: 'login' });
  } else {
    res.render('projectEntry', { title: 'Portfolio Project' });
  }
});

/* Renders the create portfolio piece page if button clicked */
router.post('/projectEntry', function (req, res, next) {
  //console.log(req.body);
  //console.log(req.file);

  var project = {};
  project.title = req.body.projectTitleText;
  project.desc = req.body.projectDescText;
  project.tags = req.body.projectTagsText;

  allProjects.push(project);

  /////////////////////////////////////////////////////////////////
  // MongoDB

  mongoClient.connect(url, function (err, conn) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      console.log("There is a connection for the projectEntry page");
      conn.collection('project').insertOne(project, function (err, result) {
        if (err) {
          console.log(err);
          throw err;
        }
        else {
          var cursor = conn.collection('projects').find();
          cursor.toArray(function (err, docs) {
            console.log("Insertion complete");
            conn.close();
          });
        }
      });
    }
  });
  //////////////////////////////////////////////////////////// 

  res.render('admin', { title: 'Portfolio Project' });
});

/* Renders the login page if button clicked */
router.get('/loginAccount', function (req, res, next) {
  console.log('The username is :' + username);
  console.log('The username that was typed was' + username);
  res.render('loginAccount', { title: 'Login to manage your Portfolio' });
});

/* Renders the project list page if button clicked */
router.get('/admin', function (req, res, next) {
  console.log(username);
  if (username.length == 0) {
    res.render('loginAccount', { title: 'login' });
  } else {
    res.render('admin', { title: 'Manage your portfolio' });
  }
});

/* Renders the admin page if button clicked */
router.post('/loginAccount', function (req, res, next) {
  if ((username == req.body.username) && (password == req.body.password)) {
     console.log("hi");
     res.render('admin', { title: 'Manage your portfolio' });
   }
   else {
     console.log("bye");
     res.render('loginAccount', { title: 'login' });
   }
});

/* Renders the project list page if button clicked */
router.get('/projectList', function (req, res, next) {
  if (username.length == 0) {
    res.render('loginAccount', { title: 'login' });
  } else {
    res.render('projectList', { title: 'Portfolio Pieces' });
  }
});

router.get('/logout', function (req, res, next) {
  // To logout I simply destroy the session (and thus the username property on it)
  //req.session.destroy();
   username = "";
   password = "";
  res.render('loginAccount');
});

/* Renders the create login page if button clicked */
router.post('/createAccount', function (req, res, next) {
  //username = req.body.username;
  //username = username.trim();
  username = req.body.username;
  password = req.body.password;
  username = username.trim();
  password = password.trim();

  console.log(username);
  console.log(password);

  res.render('loginAccount');
});

router.get('/createAccount', function (req, res, next) {
  res.render('createAccount', { title: 'Login to manage your Portfolio' });
});

module.exports = router;

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

// Varaible to act a counter/unique id as it increments, i know I could also use the mongo assigned id, 
// but I cant seem to get it to  work, I'm probably calling it wrong
var projectCounter = 0;

/////////////////////////////////////////////////////////////////////////////////////////////////
// MongoDB
// I am requiring mongoDB and client so I can establish a database and connection so secrets can
// be stored in the database
var mongoClient = require('mongodb').MongoClient;

// This is a variable that will either run the database from the set environment variables I have
// set online or local host address
var url = process.env.CUSTOMCONNSTR_portfolioBuilderEiren || 'mongodb://localhost:27017/mongoDBAssignment02';

/////////////////////////////////////////////////////////////////////////////////////////////////

// If a get request for the index page, it will render the index page
router.get('/', function (req, res, next) {
  res.render('index');
});

// If a get request for the projectEntry, it checks first if there is a username of if it is empty,
// if its empty it directs the user to the login page, if not it allows the user to go view the 
// project entry page
router.get('/projectEntry', function (req, res, next) {
  if (username.length == 0) {
    res.render('loginAccount', { title: 'login' });
  } else {
    res.render('projectEntry', { title: 'Portfolio Project' });
  }
});

// If a post request for projectEntry is called, the following will be executed
router.post('/projectEntry', function (req, res, next) {

  // Creating an object variable
  // Assigning the object different properties such as an id, title, description and tags,
  // These hold the values entered in the project entry page for the corresponding fields
  var project = {};
  project.id = projectCounter;
  project.title = req.body.projectTitleText;
  project.desc = req.body.projectDescText;
  project.tags = req.body.projectTagsText;

  // Incrementing the project counter that acts like an id, in order for delete to work
  projectCounter++;

  // Pushing all the properties and values into the allProjects array
  allProjects.push(project);
  
  // MongoDB
  // Connecting to the mongo client, this will console out if there is a connection 
  // and also let me know if there is any errors.
  mongoClient.connect(url, function (err, conn) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      console.log("There is a connection for the projectEntry page");

      // Connecting to the collection called project and checing there is an error, if
      // not it will find the collection called projects and store its contents in an array
      // then it will render the portfolio page so that it has the entries
      // It will notify when an insertionhas been made, this is to ensure that it is fact 
      // inserting into the database
      conn.collection('project').insertOne(project, function (err, result) {
        if (err) {
          console.log(err);
          throw err;
        }
        else {
          var cursor = conn.collection('projects').find();
          cursor.toArray(function (err, docs) {
            res.render('portfolio', { project: docs });
            console.log("Insertion complete");
            // conn.close();
          });
        }
      });
    }
  });
  // This will render the admin page
  res.render('admin', { title: 'Portfolio Project' });
});

// If a get request for the portfolio page is recieved, it will render the portfolio page
// And display the projects entered and make the username value on that page equal the value 
// of the variable username so when the user goes to view their portfolio it says 
// "(Username) Portfolio"
router.get('/portfolio', function (req, res, next) {
  res.render('portfolio', { project: allProjects, username: username });
});

// If a get request for login Account is received, it wll console out the username and
// render the login page and assiging it the specified title
router.get('/loginAccount', function (req, res, next) {
  console.log('The username is :' + username) ;
  res.render('loginAccount', { title: 'Login to manage your Portfolio' });
});

// If a get request for the admin page is received, it checks if the user is logged in, if  
// not, then they are directed to the user login but if they are, they are directed to admin
router.get('/admin', function (req, res, next) {
  console.log(username);
  if (username.length == 0) {
    res.render('loginAccount', { title: 'Login to manage your Portfolio' });
  } else {
    res.render('admin', { title: 'Manage your portfolio' });
  }
});

//If a post request for login account s receieved, it checks is it the user name made in the 
// create account or is it the default username and password that was used. If so, they are 
// directed to admin, if it is neither of these the user is directed back to the login page and told
// it was a wrong login
router.post('/loginAccount', function (req, res, next) {
  if ((username == req.body.username) || (username = req.body.username == "student")) {
    if ((password == req.body.password) || (password = req.body.password == "password")) {
      console.log("hi");
      res.render('admin', { title: 'Manage your portfolio' });
    }
  }
  else {
    console.log("bye");
    res.render('loginAccount', { title: 'Wrong Login, please try again' });
  }
});

// If a get request for projectList is called, it checks to see whether the username is empty it will 
// return the user to the login page but if not it will allow them to view the project list that holds 
// all the projects and can be deleted
router.get('/projectList', function (req, res, next) {
  if (username.length == 0) {
    res.render('loginAccount', { title: 'Wrong Login, please try again' });
  } else {
    res.render('projectList', { project: allProjects, username: username });
  }
});

// If a get request for deleteme is called, it will loop around the allProjects array and delete the
// project selected and splice it out of the array, it will then refresh the page to show the
// that the object was removed
router.post('/deleteme', function (req, res, next) {
  for (var j = 0; j < allProjects.length; j++) {
    if (req.body.id == allProjects[j].id) {
      allProjects.splice(j, 1);
    }
  }
  res.redirect("/projectList");
});

// If a get request for logout is called. This will make the values of username and password equal to nothing / null / 0
// Then rendering the login account, so the user can make another new account. 
router.get('/logout', function (req, res, next) {
  username = "";
  password = "";
  res.render('loginAccount');
});

// If a post request for create account is called, the following lines will be executed
router.post('/createAccount', function (req, res, next) {
  // Making the variables username and password equal the value of the fields that have 
  // the name username or password. Then I a trimming it to get rid of any spaces that may have been accidently entered
  username = req.body.username;
  password = req.body.password;
  username = username.trim();
  password = password.trim();

  // Consoling out the valuesfor username and passowrd, to ensure that they are in fact being assigned the correct values
  console.log(username);
  console.log(password);

  // Rending the login page, so the user can now login and begin editing their portfolio
  res.render('loginAccount');
});

// If a get request for create account is called, it will render the create account page and assign it, its title
router.get('/createAccount', function (req, res, next) {
  res.render('createAccount', { title: 'Login to manage your Portfolio' });
});

module.exports = router;

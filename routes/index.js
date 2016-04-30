var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var files = new Array();

var username ="";

///////////////////////////////////////////////////////////////////////////////////////////////

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
  res.render('index', {title:'Portfolio Home Page'});
});

router.get('/uploadFile', function (req, res, next) {
  res.render('uploadFile');
});

router.post('/uploadFile', function (req, res, next) {
  console.log(req.body);
  console.log(req.file);
});

router.post('loginAccount', function(req,res, next){
    username = req.body.username;
    password = req.body.password;
});

/* Renders the create portfolio piece page if button clicked */
router.post('/projectEntry', function (req, res, next) {
  res.render('projectEntry', { title: 'Create a Portfolio Piece' });
  
  /////////////////////////////////////////////////////////////////
  // MongoDB
    
    mongoClient.connect(url, function(err, conn) {
        if (err) {
            console.log(err);
            throw err;
        } else {
          console.log("There is a connection for the projectEntry page");
        }
    });
   //////////////////////////////////////////////////////////// 

});

router.post('projectEntry', function(req,res,next){
    res.render('projectEntry');
});

/* Renders the login page if button clicked */
router.get('/loginAccount', function (req, res, next) {  
  res.render('loginAccount', { title: 'Login to manage your Portfolio' });
  
  console.log('The username is :' + username);
  console.log('The username that was typed was' + username);
});

/* Renders the project list page if button clicked */
router.get('/admin', function (req, res, next) {
  res.render('admin', { title: 'Admin Page' });
});

/* Renders the admin page if button clicked */
router.post('/admin', function (req, res, next) {
  res.render('admin', { title: 'Manage your portfolio' });
});

/* Renders the project list page if button clicked */
router.get('/projectList', function (req, res, next) {
  res.render('projectList', { title: 'Portfolio Pieces' });
});

router.get('/logout', function(req, res, next) {
  // To logout I simply destroy the session (and thus the username property on it)
 // req.session.destroy();
  username = "";
  res.render('login');  
});

/* Renders the create login page if button clicked */
router.post('/createAccount', function (req, res, next) {
  username =  req.body.username;
  //username = username.trim();
  
  if (username.length == 0) {
    res.redirect('/login');
    console.log('Couldnt login sorry :( ');
  }
  else {
    req.session.username = username;
    res.redirect('/');
  }
});

router.get('/createAccount', function (req, res, next) {
  res.render('createAccount', { title: 'Login to manage your Portfolio' });
});

module.exports = router;

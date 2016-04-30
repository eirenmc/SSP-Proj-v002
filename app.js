var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var routes = require('./routes/index');

var session = require('express-session');

//////////////////////////////////////////////////////////////////////////////////////////
//Mongo

var mongoClient = require('mongodb').MongoClient;

var url = process.env.CUSTOMCONNSTR_portfolioBuilderEiren || 'mongodb://localhost:27017/mongoDBAssignment02'; 

mongoClient.connect(url, function(err, conn) {
  if(err){
      console.log(err.message);
      throw err;
  } else {
      console.log("A connection has been established with the Database");
      conn.close();
  }
});
/////////////////////////////////////////////////////////////////////////////////////////
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('uploads'));
/*
var multerOptions = {
  dest: './uploads/',
  rename: function(fieldname, filename) {
    return filename+"_"+Date.now();
  }
};

app.use(multer(multerOptions));
*/
var storageMethod = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("In destination");
        fs.exists('./uploads/', function(exists){
            if(!exists){
                //fs.mkdir('./bin/uploads/', function(error){
                  fs.mkdir('./uploads/', function(error){
                        cb(error, './uploads/');
                    })    
                }
        
            else{
                    cb(null, 'uploads');
                }
            })
        },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

app.use('/', multer({storage: storageMethod}).any());
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/*
  This is a line, that when you inspect the html 
  of the page in the broswer it makes easily reable, 
  without this my html code would be minified and very 
  hard to understand. I am using this to make sure that
  my html is being outputted corectly and it is easier 
  for me to tell which elements are being affected how. 
  i.e if there are nested elements.
*/
app.locals.pretty = true;

module.exports = app;

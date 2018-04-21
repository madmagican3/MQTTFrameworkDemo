var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var MQTTController = require('./Controllers/MQTTController');
var index = require('./routes/index');
var portControl = require("./Controllers/SerialPortController");
var app = express();

portControl.serverConnect();

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

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

MQTTController.Construct('msqtt://80.240.137.162:1883', ["TemperatureControl", "TemperatureSettings"], onMessage);

module.exports = app;

/**
 * On a new thing in the mqtt publisher
 * @param topic The topic it came from
 * @param message The message we recieved
 */
function onMessage(topic, message) {
    // We determine what type of message it is
    //We then force send some json the REST api
    var value = JSON.parse(message.toString()); //parse it to json
    console.log(value);
    if (topic == "TemperatureControl") {
      MQTTController.setTemp(value.temp);
    } else {
      MQTTController.setControls(value);
    }

}
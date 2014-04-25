require('newrelic');

var express = require("express")
  , app = express()
  , flash = require('connect-flash')
  , passport = require('passport')
  , port = process.env.PORT || 5000
  , io = require('socket.io').listen(app.listen(port));

app.use(express.static(__dirname + '/public'));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({secret: 'secret'}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// flash middleware
app.use(function(req, res, next) {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.warning = req.flash('warning');
  next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var routes = require('./routes'),
    login = require('./routes/login'),
    chat = require('./routes/chat');

routes.set(app);
login.init(app);
chat.init(io);

console.log("Listening on port " + port);

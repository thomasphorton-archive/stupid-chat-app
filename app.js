require('newrelic');

var express = require("express")
  , app = express()
  , db = require('./database')
  , passport = require('passport')
  , port = process.env.PORT || 5000
  , io = require('socket.io').listen(app.listen(port))
  , _ = require('./public/js/underscore-min');

app.use(express.static(__dirname + '/public'));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({secret: 'secret'}));

app.use(passport.initialize());
app.use(passport.session());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render("index");
});

app.get("/login", function(req, res) {
  res.render("login", {title: 'Login'});
});

app.get("/signup", function(req, res) {
  res.render("signup", {title: 'Sign Up'});
});

login = require('./routes/login')(app, db, passport, _);

chat = require('./routes/chat')(app, io, db, _);

user = require('./routes/user')(app, io, db, _);

// console.log(chat.users_online);

console.log("Listening on port " + port);
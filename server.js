var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);



var passport = require('passport'),
    passportConfig = require('./config/passport');


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || require('./config/database').url );
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');


app.use(
  express.static(__dirname + '/public'),
  bodyParser.urlencoded({extended: false}),
  require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection, ttl: 8 * 60 * 60 })
  }),
  flash(),
  passport.initialize(),
  passport.session()
)






// webpage pages and routes to authenticate 
require('./controllers/admin')(app, passport);
// login and signup pages (still not authenticated)
require('./controllers/memsys')(app);

//////////////////////////////////////////////////////////////////////////////////////

// controllers/users must in this order, above the controllers/index file because the 
// auth check in on top of users file
require('./controllers/users')(app);
require('./controllers/index')(app);

app.use(function(req, res){
    res.redirect("/home");
});








var server = app.listen(8888, function() {
	console.log('Express server listening on port ' + server.address().port);
});

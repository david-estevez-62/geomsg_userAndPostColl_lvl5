
// We also will be using our User model
var User = require('../models/users');



var performLogin = function (req, res, next, user) {
  // Passport injects functionality into the express ecosystem,
  // so we are able to call req.login and pass the user we want
  // logged in.
  
  req.login(user, function (err) {

    // If there was an error, allow execution to move to the next middleware
    if (err) return next(err);

    // Otherwise, send the user to the homepage.
    return res.redirect('/home');
    // return res.redirect('/' +id+'/home');
  });
};


module.exports = function(app, passport){
  app.get("/signin", function (req, res) {
    // Render the login jade template. We are using the "flash" system, which are variables
    // that can be sent from view to view and are removed after use. Useful for quick messages l
    // ike "failed to login." In this case, we pull any existing flash message id'd as "error"
    // and pass it to the view.

    //username or password doesn't match whats in the database
    res.render('signin', { info: req.flash('info') });
  });



  app.post("/signin", function (req, res, next) {

    // Passport's "authenticate" method returns a method, so we store it
    // in a variable and call it with the proper arguments afterwards.
    // We are using the "local" strategy defined (and used) in the
    // config/passport.js file

    var authFunction = passport.authenticate('localSignIn', function(err, user, info){

      // If there was an error, allow execution to move to the next middleware
      if(err) return next(err);

      // If the user was not successfully logged in due to not being in the
      // database or a password mismatch, set a flash variable to show the error
      // which will be read and used in the "login" handler above and then redirect
      // to that handler.
      if(!user) {
        return res.redirect('/signin');
      }

      // If we make it this far, the user has correctly authenticated with passport
      // so now, we'll just log the user in to the system.
      performLogin(req, res, next, user);
    });

    // Now that we have the authentication method created, we'll call it here.
    authFunction(req, res, next);
  });



  app.post("/signup", function(req, res, next){

    var data = req.body;

    // Create a new instance of the User model with the data passed to this
    // handler. By using "param," we can safely assume that this route will
    // work regardless of how the data is sent (post, get).
    // It is safer to send as post, however, because the actual data won't
    // show up in browser history.
    var user = new User({
      username: data.username,
      password: data.password
      // email: req.body.email
    });

    

    // Now that the user is created, we'll attempt to save them to the
    // database.
    user.save(function(err, user){

      // If there is an error, it will come with some special codes and
      // information. We can customize the printed message based on
      // the error mongoose encounters
      if(err) {

        // By default, we'll show a generic message...
        var errMsg = 'An error occured, please try again';

        // If we encounter this error, the duplicate key error,
        // this means that one of our fields marked as "unique"
        // failed to validate on this object.
        if(err.code === 11000){
          errMsg = 'This user already exists.';
        }

        // Flash the message and redirect to the login view to
        // show it.
        req.flash('info', errMsg);
      }

      req.flash('info', 'Your account was successfully created. Enter using those credentials');
      // If we make it this far, we are ready to log the user in.
      return res.redirect('/signin');
    });
  }),


  app.get("/signout", function(req, res){

    // Passport injects the logout method for us to call
    req.logout();

    // Redirect back to the login page
    res.redirect('/signin');
  })
};

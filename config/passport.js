// First, we'll need passport...
var passport = require('passport');

// We also need the strategy defined by our 'passport-local' module.
// Strategies are how passport abstracts the logic of working with
// different login systems like Facebook or Twitter. You can also
// use multiple strategies to support more auth types.
var LocalStrategy = require('passport-local').Strategy;

// Since we will be using the user model to control access and
// persistence, we'll use that as well.
var User = require('../models/users');


// SERIALIZATION:
//  This small subset of code will take a user object, used
//  in our JS, and convert it into a small, unique, string
//  which is represented by the id, and store it into the
//  session.
passport.serializeUser(function(user, done){
  done(null, user.id);
});

// DESERIALIZATION:
//  Essentially the inverse of above. This will take a user
//  id out of the session and convert it into an actual
//  user object.
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});


// var localSignUp = new LocalStrategy({
//   passReqToCallback: true
// },
//   function(req, username, password, next){

//     // Look for user in the database with the same username
//     User.findOne({ 'local.username' : username}, function(err, user){
//       if (err) return next(err);

//       // If the user already exists, return false
//       if (user){
//         return next(null, false, req.flash('signUpError', 'That username is taken.'));
//       }
//       // Otherwise, create a new user 
//       else {
//         var newUser = new User();
        
//         newUser.generateHash(password, function(err, hash){

//           newUser.local.password = hash;
//           newUser.local.username = username;

//           // Save the user
//           newUser.save(function(err){
//             if (err) throw err;
//             return next(null, newUser);
//           });
//         });  
//       }
//     });
//   }
// );

// LOCAL SIGNIN 
var localSignIn = new LocalStrategy({
  passReqToCallback: true
},
  function(req, username, password, next){
    
    // Check to see if user is in the database
    User.findOne({'username':username}, function(err, user){

      ////////////////////////////
      // console.log(arguments) //
      ////////////////////////////

      if (err) return next(err);

      // If user is not found...
      if (!user){
        return next(null, false, req.flash('info', 'No user found'));
      }

      user.comparePassword(password, function(err, isMatch){

      ////////////////////////////
      // console.log(arguments) //
      ////////////////////////////
      ///
        if (err) return next(err);

        // Passwords don't match...
        if(!isMatch){
          return next(null, false, req.flash('info', 'Wrong password'));
        }
        // Passwords match... so return the user
        else {
          return next(null, user);
        }
      });

    });
  }
);

// Passport needs to know about our strategy definition above, so
// we hook that in here.
// passport.use('localSignUp', localSignUp);
passport.use('localSignIn', localSignIn);



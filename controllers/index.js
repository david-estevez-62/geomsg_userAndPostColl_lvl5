
var Message = require('../models/messages.js');




module.exports = function(app) {
  app.use(function(req, res, next){
      if(req.isAuthenticated()){
        return next();
      }
      else{
        res.redirect('/signin');
      }
  });

  app.get('/home', function(req, res) {

      res.render('index', {
        user: req.user
      });
    
  });

  app.get('/msgs', function(req, res){

      var geoJSONpoint = {
        "type": "Point",
        "coordinates": [
             parseFloat(req.user.location.coordinates[0]),
             parseFloat(req.user.location.coordinates[1])
         ]
      }

      Message.find({ "location.coordinates": {"$nearSphere": { "$geometry": geoJSONpoint, "$maxDistance": 175 } }} , function(err, data){
          // if (err) return handleErr(err);
          res.send(data)

      });

  });
};

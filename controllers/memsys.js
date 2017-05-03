
module.exports = function(app){
	app.get("/", function(req, res) {
		if(req.isAuthenticated()){
	      res.redirect("/home");
	    }
	    else{
	      res.redirect('/signin');
	    }
	});

	app.get("/signup", function(req, res){
  		res.render('signup');
	});

};
var User = require('../models/users.js');
var Message = require('../models/messages.js');




var fs = require('fs');
var multer  = require('multer');



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/uploads/')
  },
  filename: function (req, file, cb) {
    var fileNameSpaceless = (file.originalname).replace(/\s/g, '');

    fs.exists('public/img/uploads/' + fileNameSpaceless, function(exists) {
    var uploadedFileName;

      if (exists) {
          uploadedFileName = (Date.now() + '_' + file.originalname).replace(/\s/g, '');
      } else {
          uploadedFileName = fileNameSpaceless;
      } 
      cb(null, uploadedFileName)

  });
    
  }
})

var upload = multer({ storage: storage });





module.exports = function(app) {
  app.post('/locate', function (req, res) {
          var data = req.body;
          

          var date = new Date();
          var username = req.user.username;
          

          User.findOne({username:username}, function(err, user) {
            if (err) return handleErr(err);


            find = {
              coordinates: [data.lat, data.lng],
              datetime: date
            };

            user.location = find;
            user.save();

          });

          res.send('OK');

  });


  app.post('/addmsg', upload.single('uploadedimg'), function(req, res) {
        var imgFile;

        if(req.body.imgurl){
            imgFile = req.body.imgurl;
        } else if(req.file){
            imgFile = "/img/uploads/"+req.file.filename;
        }


        var newMsg = new Message({
            datetime: new Date(),
            expiresBy: new Date(),
            postedBy: req.user._id,
            contents: {
              imgFile: imgFile || '',
              imgFileDescrip: req.body.imgdescrip || '',
              text: req.body.content
            },
            location: {
              coordinates: [req.body.latcoord, req.body.lngcoord]
            }
        });

        newMsg.save(function(err, data){
          res.send(data);
        })

  });

};

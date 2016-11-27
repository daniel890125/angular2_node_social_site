var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var async = require('async');
var jwt = require('jsonwebtoken');
var experiences_advertise = require('../model/experiences_advertise');
var imageData = require('../model/imageModel');
var experiences = require('../model/experiences');
var experiencesEn = require('../model/experiencesEN');
var Comments = require('../model/comments');
var user = require('../model/user');
var config = require('../config/auth');
// var gridfs = require('./model/gridfs');
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport")
var request = require('request');


var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.gmail.com",
    secureConnection : false,
    port: 587,
    auth : {
        user : "smarterexperiences@gmail.com",
        pass : "savetheplanet1"
    }
}));







var done=false;
var fName='';
var actFName='';
var contentType='';


router.use(multer({dest: './public/upload',
	rename: function (fieldname, filename) {
		fName = filename;
		console.log('Filename: '+fName);
    return fName;
	},

	onFileUploadComplete: function (file) {
     fName = file;
	  console.log(file.fieldname + ' uploaded to  ' + file.path);
    // console.log("File name: "+fName);
    if(actFName=='')
      actFName = file.path;
    // else if(fs.existsSync(actFName))
    //   fs.unlinkSync(actFName);
    console.log('File uploaded.....');
	  done=true;
	},
	onError: function(error,next){
		console.log('Error during upload: '+error);
	}
}));


router.get('/',function(req,res){
  console.log('default home page');
  res.send('no output');
});
router.post('/addprofileimage',function(req,res){
    if(done==true) {
        //var bodyData = JSON.parse(req.body);
        //console.log(req.body.userid);

        async.waterfall([
            function(cb) {
                uploadImage(req,function(response){
                    console.log('Images id:: '+response.length);
                    cb(null,response);
                });
            },
            function(imageId,cb) {
                user.update({_id:req.body.userid},{$set:{
                    profileImage:imageId[0]
                }}).lean().exec(function(err,docs){
                    if(err) {
                        console.log('Profile Image update failed.. '+err);
                        res.send('failed');
                    }
                    else
                        res.send('success');
                });
            }
            ]);
    }
})





router.get('/removeProfileImage/:id',function(req,res){
    user.findOne({_id:req.params.id}).lean().exec(function(err,usr){
            if(err){
                console.log('No record found.. '+err);
            }
            else if(usr!=null && usr.profileImage!=''){
                var imageId = usr.profileImage.split('/')[2];
                imageData.find({_id:imageId}).lean().exec(function(err,result){
                    if(result){
                        imageData.remove({'_id': imageId}, function(err, data){
                            if(err)
                                console.log('Unable to Delete: '+err);
                            else {
                                user.update({_id:req.params.id},{$set:{ profileImage:'/assets/fonts/male.png' }}).lean().exec(function(err,docs){
                                if(err) {
                                    console.log('Profile Image update failed.. '+err);
                                    res.json('failed');
                                }
                                else
                                    res.json('success');
                            });
                            }

                        });

                    }

            });

            }

        })
})





function sendMessageAdmin(doc){


  smtpTransport.sendMail({
      from: config.smtpConfig_addCompanyInfo.bcc, // sender address
      to: config.smtpConfig_addCompanyInfo.bcc, // comma separated list of receivers
      bcc:'',
      subject: config.smtpConfig_addCompanyInfo.subject, // Subject line
      html: "Hallo liebes Team, ein Produkt wurde von " + doc.companyName + doc.email + doc.user + doc.city + " hinzugefügt.<br><br>Bitte hinzugefügtes Produkt prüfen.<br><br><b>1. Produkt freigeben:</b><br><br><a>http://localhost:3000/exp/recordApproval/"+ doc._id+ "</a>"+ "<br><br><b>2. Produkt löschen:</b><br><br><a>http://localhost:3000/exp/deleteExperiences/"+ doc._id+ "</a>"
  }, function(error, response){
          if(error){
                  console.log(error);
          }else{
                  console.log("Message sent success");
          }
      });

}

function sendMessageUser(doc){


  smtpTransport.sendMail({
      from: config.smtpConfig_addCompany.bcc, // sender address
      to: config.smtpConfig_addCompany.bcc, // comma separated list of receivers
      bcc:'',
      subject: config.smtpConfig_addCompany.subject, // Subject line
      html: config.smtpConfig_addCompany.textMessage,
  }, function(error, response){
          if(error){
                  console.log(error);
          }else{
                  console.log("Message sent success");
          }
      });

}



router.post('/experience',function(req,res){
    console.log('experience called');
    // console.log(req);
    if(done==true) {

        console.log("request coming from experience");
        console.log(req.body);
        var bodyData = JSON.parse(req.body.obj);
        console.log(bodyData);
        var now = new Date();
      console.log("https://maps.googleapis.com/maps/api/geocode/json?address="+ bodyData.postcode+bodyData.city + "&key=AIzaSyD9hs4YN2wcRBzO9BGj1iQ6urLHEHkmLrk")
      request("https://maps.googleapis.com/maps/api/geocode/json?address="+ bodyData.postcode+bodyData.city + "&key=AIzaSyD9hs4YN2wcRBzO9BGj1iQ6urLHEHkmLrk", function (error, response, body) {
      if (!error && response.statusCode == 200) {
      obj = JSON.parse(body);

        async.waterfall([
            function(cb) {
                console.log('upload Image started');
                uploadImage(req,function(response){
                    console.log(response);
                    console.log('uploaded image');
                    // console.log('Images id:: '+response.length);
                    cb(null,response);
                });
            },
            function(imageId,cb) {
                    exp = new experiences();
                    expen = new experiences();


                    exp.category = bodyData.category;
                    exp.specCategory = bodyData.specCategory
                    exp.price = bodyData.price;
                    exp.currency = bodyData.currency;
                    exp.companyName = bodyData.companyName;
                    exp.address = bodyData.address;
                    exp.nr = bodyData.nr;
                    exp.amountProduct =bodyData.amountProduct;
                    exp.city = bodyData.city;
                    exp.postcode = bodyData.postcode;
                    exp.title = bodyData.title;
                    exp.description = bodyData.description;
                    exp.leistung=bodyData.leistung;
                    exp.dauer= bodyData.dauer;
                    exp.offerDate=bodyData.offerDate;
                    exp.created_at=now;
                    exp.updated_at=now;
                    exp.review = 0;
                    exp.images = imageId;
                    exp.email = bodyData.email;
                    exp.user = bodyData.user;
                    exp.added = true;
                    exp.aktivStatus = false;
                    exp.loc = {"type":"Point","coordinates":[obj.results[0].geometry.location.lng, obj.results[0].geometry.location.lat]};//lon, lat
                    exp.lat =  obj.results[0].geometry.location.lat;
                    exp.lon = obj.results[0].geometry.location.lng;
                    exp.wishlist =[];
                    exp.lan = "de";



                    exp.save(function(err,doc){
                      //console.log(doc);
                        if(err)
                            console.log("Experiences saving error: "+ err);
                        else {

                          // sendMessageAdmin(doc);
                          // sendMessageUser(doc);
                        //res.json("success");
                    }
                });
                  console.log(bodyData.worldwide + ' $$$$$$$');

                  if(bodyData.worldwide == true){

                                expen.worldwide = bodyData.worldwide;
                                expen.images = imageId;
                                expen.lan = 'en';
                                expen.save(function(err,data){

                                    if(err)
                                        console.log("Experiences saving error: "+ err);
                                    else {
                                      sendMessageAdmin(data);
                                      //sendMessageUser(data);

                                }
                              });


            }
              res.json("success");
          }
        ]);
      }else{

        console.log("error recognizing lat, long adding records");
      }
 })
    };
});

function uploadImage(req,cb) {
    var file = req.files.file;
    var imageId=[];
    var imgLength;
    if(file.length==undefined)
        imgLength = 1;
    else
        imgLength = file.length;

    for (var i = 0; i < imgLength; i++) {
        upload = new imageData();
        upload._id = mongoose.Types.ObjectId(req.body._id);
        if (file.length != undefined) {
            upload.type = file[i].mimetype;
            var imgPath = './public/upload/' + file[i].name;
        }
        else {
            upload.type = file.mimetype;
            var imgPath = './public/upload/' + file.name;
        }
        upload.files = fs.readFileSync(imgPath);
        upload.save(function(err,data){
            if(err)
                console.log('upload image failed...'+ err);
            else {
                imageId.push('/image/'+data._id);
                if(imageId.length == imgLength) {
                    for(var i=0; i< imgLength; i++){
                        if (file.length != undefined)
                            var imgPath = './public/upload/' + file[i].name;
                        else
                            var imgPath = './public/upload/' + file.name;
                        fs.unlinkSync(imgPath);
                    }
                    cb(imageId);
                }

            }
        });

    }

}

router.post('/add',function(req,res){
    if(done==true){
        console.log(req.body.obj);
        var bodyData = JSON.parse(req.body.obj);
        experiences.find({_id:bodyData.experienceId}).lean().exec(function(err,result) {
            if (err) {
                console.log('Insert image failed.. ' + err);
                res.json('failed');
            }
            else {
                for(var i=0; i < result[0].images.length; i++)
                    imageData.remove({'_id':result[0].images[i]}).lean().exec(function(err,data){
                        if(err)
                            console.log('unable to delete Image: '+err);
                    });
            }
        });
        uploadImage(req,function(response){
            experiences.update({_id:bodyData.experienceId},{$set:{
                images:response
            }}).lean().exec(function(err,docs){
                if(err) {
                    console.log('Insert image failed.. '+err);
                    res.json('failed');
                }
                else
                    //console.log(docs)
                res.json('success');
            });
        });
    }
});


router.get('/:id',function(req,res){
    //console.log("Image Id : "+req.params.id);
    imageData.find({_id:req.params.id}).lean().exec(function(err,result){
        if(err)
            console.log('Unable to find record: '+err);
        else if(result!=null || result[0].files.length!=0) {
            // console.log('result type: '+result[0].type);
            res.writeHead(200, {'Content-Type': result[0].type});
            res.write(result[0].files[0].buffer,'buffer');
            res.end();

        }
        else
            res.end();
    });

});
module.exports = router;

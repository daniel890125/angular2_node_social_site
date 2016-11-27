var express = require('express');
var router = express.Router();
var User = require('../model/user');
var bcrypt   = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var passport = require('passport')
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('../config/auth');
var loggedUser = '';
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");


var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.gmail.com",
    secureConnection : false,
    port: 587,
    auth : {
        user : "smarterexperiences@gmail.com",
        pass : "savetheplanet"
    }
}));




function isObjectId(n) {
    return true;
    //return mongoose.Types.ObjectId.isValid(n.toString());
}

isAdmin = function(req,res,next){
    User.findOne({email: loggedUser}).lean().exec(function (err, user) {
        if (user.role != null && user.role==2)
            return next();
    })
};

router.get('/mail/:id',function(req,res){
    console.log('mail send processing:: '+ req.params.id);

    User.findOne({_id:req.params.id}).lean().exec(function(err,user) {
        if (err)
            console.log('No user found: ' + err);
        else {
            smtpTransport.sendMail({
                from: config.smtpConfig.fromId, // sender address
                to: user.local.email, // comma separated list of receivers
                bcc:config.smtpConfig.fromId,
                subject: config.smtpConfig.subject, // Subject line
                html: "Hallo,<br><br>"+config.smtpConfig.textMessage // html text body
            }, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }
            });
            res.send({role: user.role, id: user._id});
        }
    })
})

router.get('/fetchpass/:email',function(req,res){
    User.findOne({'local.email':req.params.email}).lean().exec(function(err,user){
        if(user!=null) {
            //bcrypt.
            var url = "http://smarter-experiences.de/#/setpass/"+user._id;
            var textMessage = "Bitte <a href='"+url+"'>klicke hier</a> um dein Passwort zurückzusetzen";
            smtpTransport.sendMail({
                  from: config.smtpConfig_addCompany.bcc, // sender address
                  to: user.local.email, // comma separated list of receivers
                  // bcc:config.smtpConfig_addCompany.bcc,
                  subject: config.smtpConfig.passSubject, // Subject line
                  html: "Hallo <strong>"+user.local.nameMain+",</strong><br>"+textMessage+"<br><br> Mit freundlichen Grüßen,<br> Ihr Smarter Experience Team" // html text body
              }, function(error, response){
                  if(error){
                      console.log(error);
                      res.json('failed to send mail');
                  }else{
                      console.log("Message sent: " + response.textMessage);
                      res.json("success");
                  }
                });
        }
        else
            res.json('failure');
    })
});

router.get('/setpass/:id',function(req,res){
    User.findOne({_id:req.params.id}).lean().exec(function(err,user) {
        if (err)
            console.log('No user found: ' + err);
        if(user)
            res.json({id: user._id,message:'success'});
        else
            res.status(500).send({ message: 'Invalid Id' });
    });
});

router.get('/pImage/:email',function(req,res){
    console.log('email Id:: '+req.params.email);
    User.findOne({'local.email':req.params.email}).lean().exec(function(err,user){
        if(user.profileImage!=null)
        res.redirect(user.profileImage);
        else
        res.redirect('/assets/fonts/male.png');
    })
})
router.get('/pid/:id',function(req,res){
    console.log('Pid Id:: '+req.params.id);
    if(req.params.id=="undefined")
        res.redirect('/assets/fonts/male.png');
    else
        User.findOne({_id:req.params.id}).lean().exec(function(err,user){
            if(err){
                console.log('No record found.. '+err);
            }
            else if(user!=null)
                res.redirect(user.profileImage);
            else
                res.redirect('/assets/fonts/male.png');
        })

})

router.get('/getImagesProfile', function(req, res) {

    User.find({}).lean().exec(function(err, docs_accommo) {
        //console.log(docs_accommo);
        for(key in docs_accommo){
            //console.log(key);
            //console.log(docs_accommo[key]._id);

        }
        res.json(docs_accommo);
    });
});

router.get('/getUser/:id',function(req,res){
    User.findOne({_id:req.params.id}).lean().exec(function(err,user){
        if(err)
            console.log('No user found: '+err);
        else
            res.json(user);
    })
})

router.get('/',function(req,res){
    res.render('admin.html');
});

router.get('/user', function(req, res){
    User.find({}).lean().exec(function(err,data){
        if(err)
            console.log('No user found: '+err);
        else
            res.json(data);
    })    
});

router.post('/reset',function(req,res){
    console.log(req.body.id);
    User.findOne({_id:req.body.id}).lean().exec(function(err,user){
        if(err)
            console.log('No user found: '+err);
        else {
            User.update({'local.email': req.body.local.email}, {
                $set: {
                    'local.password': bcrypt.hashSync(req.body.local.password, bcrypt.genSaltSync(8), null)
                }
            }).lean().exec(function (err, docs) {
                if (err) {
                    console.log('User record update failed.. ' + err);
                    res.json('failed');
                }
                else
                //console.log(docs)
                    res.json('success');
            })
        }
    })
})


router.put('/',function(req,res){

    User.update({'local.email':req.body.local.email},{$set:{
        nameMain:req.body.local.nameMain,
        role:req.body.role
    }}).lean().exec(function(err,docs){
        if(err) {
            console.log('User record update failed.. '+err);
            res.json('failed');
        }
        else
        //console.log(docs)
            res.json('success');
    });

})
router.get('/fetchRecord/:email',function(req,res){
    User.findOne({ 'local.email' : req.params.email }).lean().exec(function(err, user) {
        if (err) {
            console.log('No user found: '+err);
            res.send('');
        }if(user){
            // console.log(user);
            res.send(user);
        }else
            res.json('');
    })
});
router.post('/logout', function(req, res){

    jwt.verify(req.body.token, 'secretKey', function(err, decoded) {
        loggedUser = '';
        if(decoded._id != null || decoded._id != undefined){
            User.findOne({
                _id : decoded._id
            }).lean().exec(function(err, user) {
                if (err) {
                    console.log('Error occured', err);

                } else {
                    if (user) {
                        res.send();
                    }

                }
            });
        }else{

            Console.log("Could not logout");
        }
    });

});

//Default role 'visitor'.
//Visitor: 0, Company: 1, Admin:2.
router.post('/signup', function(req, res) {
    console.log("This should be seen in your browser " + req.body);
    User.findOne({ email: req.body.email }).lean().exec(function(err, existingUser) {
        if (existingUser) {
            return res.send('EXIST');
        }
        var salt = bcrypt.genSaltSync(10);
        var hashPW = bcrypt.hashSync(req.body.password, salt);
        var user = new User({
            nameMain : req.body.nameMain,
            email: req.body.email,
            password: hashPW,
            role:2
        });
        user.save(function(err, result) {
            if (err) {
                res.status(500).send({ message: err.message });
            }

            res.end();
        });
    });
});

module.exports = router;

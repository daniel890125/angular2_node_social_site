"use strict";
var express = require('express');
var api = express.Router();
var User = require('../model/user');
var Comments = require('../model/comments');
var Experiences = require('../model/experiences');
var ExperiencesAdvertise = require('../model/experiences_advertise');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var async = require('async');
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport")
// var facebook = require('./facebook.js');
// var action = require('./action.js');
exports.api = api;

var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.gmail.com",
    secureConnection : false,
    port: 587,
    auth : {
        user : "smarterexperiences@gmail.com",
        pass : "savetheplanet"
    }
}));

// api.get('/', function(req, res) {
//     //  res.render('search_experiences.html',{cate:"Alle Kategorien", search:''});
//
// });

var obj= function(id,place){
    this.id = id;
    this.city = place;
}



api.get('/getplaces',function(req,res){
    // Experiences.find().select({"city":1}).exec(function(err,result){
        var arrVals=[];
        var search_term = req.query.q.replace(/\s+$/, '');
        var s_regex=new RegExp("^"+search_term,"i");;
        /*[ {'$match': { $or: [{ catplace: s_regex },{city:s_regex} ]}},
                                   {"$group": { "_id": { city: "$city" },item: { $push:  { country: "$country",lon: "$lon",specSpecCategory:"$specSpecCategory",city:"$city",lon:"$lon",lat:"$lat",catplace:'$catplace' } } }},  { $skip : 0 },{$limit:5}]*/

        Experiences.aggregate([ {'$match':   { city: s_regex }},
                                   {"$group": { "_id": { city: "$city" },item: { $push:  { country: "$country",specSpecCategory:"$specSpecCategory",city:"$city",lon:"$lon",lat:"$lat",catplace:'$catplace' } } }},  { $skip : 0 },{$limit:5}]).exec(function(err,result){
        if(err){
            console.error('Unable to fetch places..'+err);
        }
        if(result){

            for(var i=0; i<result.length; i++){

                if(result[i]!='' && result[i]!=undefined){
                       var item= result[i].item[0];
                       arrVals.push({city: item.city ,country: item.country,lon: item.lon,lat: item.lat,specspeccat:item.specSpecCategory,catplace:item.catplace,is_city:true,"placename":item.city});
                }

            }




                Experiences.aggregate([ {'$match':  { catplace: s_regex }},
                                   {"$group": { "_id": { city: "$city" },item: { $push:  { country: "$country",specSpecCategory:"$specSpecCategory",city:"$city",lon:"$lon",lat:"$lat",catplace:'$catplace' } } }},  { $skip : 0 },{$limit:5}]).exec(function(err,result1){


                                   for(var i=0; i<result1.length; i++){

                                        if(result1[i]!='' && result1[i]!=undefined){
                                               var item= result1[i].item[0];
                                               arrVals.push({city: item.city ,country: item.country,lon: item.lon,lat: item.lat,specspeccat:item.specSpecCategory,catplace:item.catplace,is_city:false,"placename":item.catplace});
                                        }

                                    }

                                     res.json(arrVals);



                 });





             //res.json(arrVals);



        }

    })
})

api.post('/wishlist', function(req, res){
  // console.log(req.body.userId + 'test');

  var query = {};

  if (req.body.userId)
    query.wishlist = req.body.userId;
  else {
    sendExperiences(req, res, query, [], 0, 0, true);
    return;
  }

  Experiences.find(query).limit(req.body.limit).lean().exec(function(err, docs_accommo) {
        if(!docs_accommo)
            console.log('Error at loading records Daniel: '+err);
        else
            Experiences.find(query).lean().exec(function (err, rec) {
                if(err)
                    console.log('Error at counting records: '+err);
                else {
                    sendExperiences(req, res, query, docs_accommo, rec.length, 0, true);
                }
            })
    });
});
api.post('/removeWishList', function (req, res) {
    Experiences.findByIdAndUpdate(req.body.recId, {
                              "$pull": {
                                  "wishlist": req.body.userId
                              },
                          }, function(err, data) {
                              if (err) return res.json(err);

                              var query = {};

                              if (req.body.userId)
                                query.wishlist = req.body.userId;
                              else {
                                sendExperiences(req, res, query, [], 0, 0, true);
                                return;
                              }

                              Experiences.find(query).lean().limit(req.body.limit).exec(function(err, docs_accommo) {
                                    if(!docs_accommo)
                                        console.log('Error at loading records Daniel: '+ err);
                                    else
                                        Experiences.find(query).lean().exec(function (err, rec) {
                                            if(err)
                                                console.log('Error at counting records: '+ err);
                                            else {
                                                sendExperiences(req, res, query, docs_accommo, rec.length, 0, true);
                                            }
                                        })
                                });
    });
});

api.post('/saveWishlist', function(req, res){
  // console.log(req.body.userId + 'test')

    Experiences.count({"_id":ObjectId(req.body.recId), "wishlist":req.body.userId}).lean().exec(function (err, count) {
                if (err) {
                    console.log('Error at counting records: ' + err);
                } else {

                    if (count > 0){
                        console.log('Removing...');
                        Experiences.findByIdAndUpdate(req.body.recId, {
                              "$pull": {
                                  "wishlist": req.body.userId
                              },
                          }, function(err, data) {
                              if (err) return res.json(err);
                                  res.json(count);
                        });
                    } else {
                        console.log('Adding...');
                        Experiences.findByIdAndUpdate(req.body.recId, {
                              "$addToSet": {
                                  "wishlist": req.body.userId
                              },
                          }, function(err, data) {
                              if (err) return res.json(err);
                                  res.json(count);
                        });
                    }
                }
    });
});

api.post('/likelistsum', function(req, res){
  // console.log(req.body.recId + 'test');

  var query = {};
  var response = [];

  if (req.body.recId) {
    query._id = req.body.recId;
  } else {
    console.log('no recID....!');
    res.send([]);
    return;
  }

  Experiences.find(query).lean().exec(function(err, doc) {
        if(!doc)
            console.log('Error at loading records Daniel: '+err);
        else {

          var likeSum = 0, unlikeSum = 0, status = 'undefined';

          if (doc[0]['likelist'] != undefined) {
              likeSum = 0;
              status = doc[0]['likelist'].indexOf(req.body.userId) == -1 ? status : 'like';
              likeSum = doc[0]['likelist'].length;
          } else {
            likeSum = 0;
          }

          if (doc[0]['unlikelist'] != undefined) {
              unlikeSum = 0;
              status = doc[0]['unlikelist'].indexOf(req.body.userId) == -1 ? status : 'dislike';
              unlikeSum = doc[0]['unlikelist'].length;
          } else {
            unlikeSum = 0;
          }

          response = {likeSum:likeSum, unlikeSum:unlikeSum, status: status};
          // console.log("doc : \n" + doc[0]);
          res.send(response);
        }
    });
});

api.post('/saveUnlikeList', function(req, res) {
Experiences.count({"_id":ObjectId(req.body.recId), "likelist":req.body.userId}).lean().exec(function (err, likecount) {
    if (err) {
      console.log('Error at counting records: ' + err);
    } else {
     Experiences.count({"_id":ObjectId(req.body.recId), "unlikelist":req.body.userId}).lean().exec(function (err, count) {
                    if (err) {
                        console.log('Error at counting records: ' + err);
                    } else {
                        // console.log("Like, unlike : " + likecount, count);
                        if (count > 0){
                            // console.log('Removing LikeList...');
                            Experiences.findByIdAndUpdate(req.body.recId, {
                                  "$pull": {
                                      "unlikelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                      res.json(count);
                            });
                        } else if(likecount == 0) {
                            // console.log('unlike-0, like-0...');
                            Experiences.findByIdAndUpdate(req.body.recId, {
                                  "$addToSet": {
                                      "unlikelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                      res.json(count);
                            });
                        } else if (likecount > 0){
                            // console.log('Adding LikeList...');
                            Experiences.findByIdAndUpdate(req.body.recId, {
                                  "$addToSet": {
                                      "unlikelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                  // console.log('Removing UnlikeList...');
                                  Experiences.findByIdAndUpdate(req.body.recId, {
                                    "$pull": {
                                        "likelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                      res.json(count);
                              });
                            });
                        } else {

                        }
                    }
        });
     }
  });
});

api.post('/saveLikeList', function(req, res) {
  Experiences.count({"_id":ObjectId(req.body.recId), "unlikelist":req.body.userId}).lean().exec(function (err, unlikecount) {
    if (err) {
      console.log('Error at counting records: ' + err);
    } else {
     Experiences.count({"_id":ObjectId(req.body.recId), "likelist":req.body.userId}).lean().exec(function (err, count) {
                    if (err) {
                        console.log('Error at counting records: ' + err);
                    } else {
                      // console.log("Like, unlike : " + count, unlikecount);

                        if (count > 0){
                            // console.log('Removing LikeList...');
                            Experiences.findByIdAndUpdate(req.body.recId, {
                                  "$pull": {
                                      "likelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                      res.json(count);
                            });
                        } else if(unlikecount == 0) {
                            // console.log('like-0, unlike-0...');
                            Experiences.findByIdAndUpdate(req.body.recId, {
                                  "$addToSet": {
                                      "likelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                      res.json(count);
                            });
                        } else if (unlikecount > 0){
                            // console.log('Adding LikeList...');
                            Experiences.findByIdAndUpdate(req.body.recId, {
                                  "$addToSet": {
                                      "likelist": req.body.userId
                                  },
                              }, function(err, data) {
                                  if (err) return res.json(err);
                                  // console.log('Removing UnlikeList...');
                                  Experiences.findByIdAndUpdate(req.body.recId, {
                                    "$pull": {
                                        "unlikelist": req.body.userId
                                  },
                                  }, function(err, data) {
                                      if (err) return res.json(err);
                                          res.json(count);
                                  });
                            });
                        } else {

                        }
                    }
        });
     }
  });
});

api.post('/load',function(req,res){
    var f_query= req.body;
    var query = generateQuery(req.body);

    var miles = Number(req.body.miles) || 20;
    var maxDistance=20;
    var minDistance=0;
        if(miles == 20){
            maxDistance= 20 * 1000; //20km
            minDistance=0;
        }
        else if(miles == 50){

            maxDistance= 50 * 1000; //50km
            minDistance= 0;
        }
        else if(miles == 100){

            maxDistance= 100 * 1000; //100km
            minDistance=0;
        }
        else if(miles == 200){

            maxDistance= 10000 * 1000; //10000km
            minDistance=0;
        }
        delete query.city;
        delete query.specspeccat;
        delete query.spec;


     if(f_query.item){

             if(f_query.item.is_city){
                        if(f_query.item.lon != 0 || f_query.item.lat != 0){
                                delete query.city;
                                if(f_query.spec.length > 0 && f_query.category != "Alle Kategorien")
                                query.category=f_query.category;

                                if(f_query.spec.length > 0 && f_query.spec != "Unterkategorie")
                                 query.specCategory=f_query.spec;



                                query.loc= {
                                         $near: {
                                             $geometry: {
                                                 type: "Point",
                                                 coordinates: [parseFloat(f_query.item.lon),parseFloat(f_query.item.lat)]
                                             },
                                             $minDistance:minDistance,
                                             $maxDistance: maxDistance
                                         }
                                     }
                           }

             }
              if(f_query.item.is_city == false){

            //    query.specSpecCategory=f_query.item.specspeccat;
                query.city=f_query.item.city;
            }

            if(req.body.city!='' && req.body.specspeccat!=='')
                query.specSpecCategory=req.body.specspeccat;


     }

    var sortquery = {};
    var specSpecCat=[];

    if(req.body.stPrice > 0 || req.body.endPrice >0)
        query.price={};
    if(req.body.stPrice>0 )
        query.price.$gte =  parseInt(req.body.stPrice);
    if(req.body.endPrice>0)
            query.price.$lte =  parseInt(req.body.endPrice);


    if(req.body.price!="" || req.body.price==-1)
        sortquery.price = req.body.price;

        if(req.body.price == 1 || req.body.price == 0){
        Experiences.find(query).sort(sortquery).limit(req.body.limit).lean().exec(function (err, docs_accommo) {
          // console.log(docs_accommo[0].loc.coordinates + " $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");

        if(!docs_accommo)
            console.log('Error at loading records Ali: '+err);
        else
            Experiences.find(query).lean().exec(function (err, rec) {
                if(err)
                    console.log('Error at counting records: '+err);
                else {
                    if(req.body.city!='' && req.body.specspeccat=='') {
                        for(var i=0; i<rec.length; i++){
                            if(specSpecCat.indexOf(rec[i].specSpecCategory)==-1)
                                specSpecCat.push(rec[i].specSpecCategory)
                        }
                    }
                    sendExperiences(req, res, query, docs_accommo, rec.length,specSpecCat, false);
                }
            })
        });
    }
    if(req.body.price == -1){

    Experiences.find({$and:[query,{"review":{$gt:0}}]}).sort([['review', 'descending']]).limit(req.body.limit).lean().exec(function (err, docs_accommo) {

    if(err)
        console.log('Error at loading records: '+err);
    else
        Experiences.find({$and:[query,{"review":{$gt:0}}]}).lean().exec(function (err, rec) {
            if(err)
                console.log('Error at counting records: '+err);
            else {
                var filter = Object.assign({}, query);

                filter.review = {$gt:0};

                if(req.body.city!='' && req.body.specspeccat=='') {
                        for(var i=0; i<rec.length; i++){
                            if(specSpecCat.indexOf(rec[i].specSpecCategory)==-1)
                                specSpecCat.push(rec[i].specSpecCategory)
                        }
                    }
                sendExperiences(req, res, filter, docs_accommo, rec.length,specSpecCat, false);
                // sendExperiences(req, res, filter, docs_accommo, rec.length, false);
            }
        })
    });


    }
});

api.get('/load',function(req,res){
    var place="";
    console.log('Redirect');
    res.redirect('/api/load/Alle Kategorien/'+place);
})

api.get('/load/:category', function(req, res) {
    console.log('Initiation');
    var query = {};
    if(req.params.category!="Alle Kategorien")
        query.category =  req.params.category;
    if(req.params.city!="undefined" && req.params.city!=undefined)
        query.city=req.params.city;
    console.log(query);
    Experiences.find(query).limit(10).exec(function(err, docs_accommo) {
        Experiences.find(query).lean().exec(function(err,rec){
           res.json({records:docs_accommo, count:rec.length});

        })
    });
});

api.get('/load/:category/:city', function(req, res) {
    console.log('Initiation');
    var query = {};


    if(req.params.category!="Alle Kategorien")
        query.category =  req.params.category;




    if(req.params.city!="undefined" && req.params.city!=undefined)
        query.city=req.params.city;



    Experiences.find(query).limit(10).exec(function(err, docs_accommo) {
        Experiences.find(query).lean().exec(function(err,rec){
          res.json({records:docs_accommo, count:rec.length});

        })
    });

});







api.post('/loadAdvertise', function (req, res) {
    var query = generateQuery(req.body);

    ExperiencesAdvertise.find(query).lean().exec(function (err, docs_accommo) {
        if (err) {
            console.log('Error at loading records: ' + err);
        } else {
            ExperiencesAdvertise.count(query, function (err, count) {
                if (err) {
                    console.log('Error at counting records: ' + err);
                } else {
                    res.json({records: docs_accommo, count: count});
                }
            })
        }
    });
});

api.get('/loadAdvertise',function(req,res){
    var place="";
    res.redirect('/api/loadAdvertise/Alle Kategorien/'+place);
})




api.post('/loadAdvertise', function(req, res) {
    var query = {};
    if(req.body.category!="Alle Kategorien")
        query.category =  req.body.category;
    ExperiencesAdvertise.find(query).limit(5).lean().exec(function(err, docs_accommo) {
        ExperiencesAdvertise.find(query).lean().exec(function(err,rec){
            res.send({records:docs_accommo, count:rec.length});
        })
    });

});

api.post('/postReviewTotal', function(req, res){

    Comments.aggregate([

        {$group: {
            _id: '$_roomID',
            sum: {$sum: '$star'},
            count: {$sum: 1},

        }}
    ], function (err, result) {


        if(result != ''){
            var calAvgReview = result[0].sum / result[0].count;

            Experiences.update({'_id': req.body.objectID}, {"review":calAvgReview}).lean().exec( function(err, data) {
                console.log(data);
            });
        }
        res.end(JSON.stringify(result));

    });
});


api.get('/getCommentsSum', function(req, res){
    Comments.aggregate([

        {$group: {
            _id: '$_roomID',
            sum: {$sum: '$star'},
            count: {$sum: 1},

        }}
    ], function (err, result) {
        //console.log(result);
        res.end(JSON.stringify(result));
    });

});


api.get('/getComments', function(req, res){
    Comments.find({}).sort({'star':-1}).lean().exec(function(err, comments){
        //console.log(comments);
        /*
         for(key in comments){
         console.log(key);
         console.log(comments[key]._id);

         }*/

        res.send(comments);

    });


});

api.post('/comments', function(req, res){

        //if (objIDIsValid) {

            var currentDate = new Date()
            var day = currentDate.getDate()
            var month = currentDate.getMonth() + 1
            var year = currentDate.getFullYear()
            var full = day + '/'+ month + '/' + year;

            var comments = new Comments({
                _creator : req.body.token,
                _roomID : req.body.objectID,
                comment : req.body.commentsData,
                star : req.body.star,
                namePerson : req.body.namePerson,
                created_at : currentDate,
                updated_at : currentDate

            });

            comments.save(function(err, comments) {
                if (err)
                    return console.error(err);
                console.log(comments);
                res.json(comments);
            });
        //}
    //});
});

api.get('/getMinMax', function(req, res) {
    var sortquery = {};
    var max=0;
    var min=0;
    sortquery.price=-1;
    Experiences.findOne().sort(sortquery).lean().exec(function (err, docs_accommo) {
        if(err)
            console.log('err for min max'+err);
        if(docs_accommo)
            max = docs_accommo.price;
        sortquery.price=1
        Experiences.findOne().sort(sortquery).lean().exec(function (err, docs_accommo) {
            if(docs_accommo)
                min = docs_accommo.price;
            res.json({'max':max, 'min':min});
        })
    })


});

api.get('/countPost', function(req, res) {
    Experiences.aggregate([

        {$group: {
            _id: '$category',
            sum: {$sum: '$star'},
            count: {$sum: 1},


        }}
    ], function (err, result) {
        //console.log(result);
        res.end(JSON.stringify(result));

    });

});

api.get('/countComment', function(req, res) {

    Comments.count({}).lean().exec(function(err, comm) {
        if (err)
            res.send(err);

        res.json(comm);
    });


});

api.post('/sendMessage',function(req,res){

  var mailOptions = {
    from: "smarterexperiences@gmail.com",
    to: req.body.email,
    subject: req.body.grund,
    generateTextFromHTML: true,
    html: "Hallo, sie haben eine Nachricht von: "+req.body.email+"<br><br>Betreff: "+req.body.grund+"<br><br>Nachricht: "+req.body.nachricht// html text body
  };

  smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
              res.end("error");
          }else{
              console.log(response.response.toString());
              console.log("Message sent: " + response.message);
              res.json("success");
          }
      });

              res.json("success");

});

api.post('/changeFriendList', function(req, res){
  var query = {};
  var response = [];

  if (req.body.userId) {
    query._id = req.body.userId;
    query.friendlist = req.body.friendId;
  }
  else
    res.send([]);

  User.count(query).lean().exec(function(err, count){
    if (err) {
      console.log("Counting Friend Error : " + err);
    } else {
      if (count == 0) {
        User.findByIdAndUpdate(req.body.userId, {"$addToSet" : {"friendlist" : req.body.friendId}}
          , function(err, data){
            if (err) {
              console.log("Adding Friend Error : " + err);
            } else {
              // console.log(data);
              // console.log("Added Friend( " + req.body.friendId + " )");
              response = {friendId : req.body.friendId, status: 'added'};
              res.send(response);
            }
          });
      } else {
        User.findByIdAndUpdate(req.body.userId, {"$pull" : {"friendlist" : req.body.friendId}}
          , function(err, data){
            if (err) {
              console.log("Removing Friend Error : " + err);
            } else {
              // console.log("Removed Friend( " + req.body.friendId + " )");
              response = {friendId : req.body.friendId, status : 'removed'};
              res.send(response);
            }
          });
      }
    }
  });
});

//get friendlist or visiterList 

api.post('/relationlist', function(req, res){
  // console.log("friendlist: UserId " + req.body.userId);
  var query = {};
  var response = {records : []};
  var listname = '';

  if (req.body.userId) {
    query._id = req.body.userId;
  }
  else {
    console.log("directly return...");
    res.send(response);
  }

  if (req.body.type) {
    console.log("Relationlist type : " + req.body.type);
    listname = req.body.type;
  }
    

  User.find(query).lean().exec(function(err, data){
    if (err) {
      console.log("User Error : " + err);
    } else {
      // console.log(data[0]);
      if (data[0][listname] != undefined) {
        // var arr = Object.keys(data[0]['friendlist']).map(function(k) { return obj[k] });
        var query1 = {'_id' : {$in : data[0][listname]}};
        console.log("query : \n" + query1);
        User.find(query1).lean().exec(function(err, data){
          if (err) {
            console.log("friendlist error occured!!!" + err);
          } else {
            console.log("success - relationlist : \n" + data[0]);
             response = {records : data};
             res.send(response);
          }
        });
        // console.log("friendlist : " + data[0]['friendlist']);
      } else {
        res.send(response);
      }
    }
  });
});

api.post('/user', function(req, res){

  User.find({}).lean().exec(function(err, data){
    if (err){
      console.log("userlist load error.");
    } else {
      var response = {records : data};
      res.send(response);
    }
  });
});

api.post('/removeuser', function(req, res){

  User.remove({'_id' : req.body.userId}).lean().exec(function(err, data){
    if (err){
      console.log("user remove error.");
    } else {
      // var response = {records : data};
      console.log("user remove success.");

      res.json('success');
    }
  });
});

// api.post('/fbfriend', function(req, res){

//   User.find({'_id' : req.body.userId}).lean().exec(function(err, data){
//     if (err){
//       console.log("user find error.");
//     } else {
//       // var response = {records : data};
//       console.log("user find success.");

//       if (data[0].facebook.token) {
//         // console.log(data[0].facebook.token);
//         facebook.getFbData(data[0].facebook.token, '/v2.8/me/taggable_friends', function (list){
//           console.log(list);
//           res.send({list : list});
//         });
//       }

//       // res.json('success');
//     }
//   });
// });

// api.post('/sendmail', function(req, res){
//   console.log(req.body);
//   action.sendmail(req, res);
// });


api.post('/setuser', function(req, res){

  User.find({'_id' : req.body.userId}).lean().exec(function(err, userData){
    if (err) {
      console.log("SetUser : catching userdata error\n" + err);
    } else {
      var updateObj = {};
      var parent_updateObj = {};
      var sp_selector = "$set";
        
      console.log("setUser : \n" + userData);
      if (req.body.name)
        updateObj.local = {
                            nameMain : req.body.name,
                            email : userData[0].local.email,
                            password : userData[0].local.password
                          };
      if (req.body.age)
        updateObj.age = req.body.age;
      if (req.body.job)
        updateObj.job = req.body.job;
      if (req.body.description)
        updateObj.description = req.body.description;

      if (req.body.visiterId) {
        updateObj.visiterlist = req.body.visiterId;
        if (req.body.updateType == 'add') 
          sp_selector = "$addToSet";
        else
          sp_selector = "$pull";
      }

      parent_updateObj[sp_selector] = updateObj;
      User.findByIdAndUpdate(req.body.userId, parent_updateObj).lean().exec(function(err, data){
        if (err){
          console.log("user update error.");
        } else {
          // var response = {records : data};
          console.log("user update success.");
          res.json('success');
        }
      });
    }
  });
});

function generateQuery(filter) {
    var query = {};

    if (filter.category && filter.category != 'Alle Kategorien') {
        query.category = filter.category;
    }

    if (filter.city) {
        query.city = filter.city;
    }

    if (filter.spec && filter.spec != 'Unterkategorie') {
        query.specCategory = filter.spec;
    }

    return query;
}

function sendExperiences(req, res, query, docs, count,specspecval) {
    var response = {records: docs, count: count, specspecval:specspecval};

        if (req.body.priceBoundaries) {
            getPriceBoundaries(query, function (err, priceBoundaries) {
                if (err) {
                    res.send(err);
                } else {
                    response.priceBoundaries = priceBoundaries;

                    res.send(response);
                }
            });
        } else {
            res.send(response);
        }

}


function getPriceBoundaries(filter, callback) {
    var query = {};
    var geoquery={};
    var gquery=[];

    ['city', 'category', 'specCategory', 'review',"specSpecCategory"].forEach(function (key) {
        if (filter[key]) {
            query[key] = filter[key];
        }
    });

    // is loc has in array remove city and add geoNear filter
    if(filter["loc"]){
        var near = filter.loc.$near;
        var geometry= near.$geometry;

       // console.log(filter["loc"],filter.loc.$near.$geometry,"query");
       geoquery= { near: { type: geometry.type, coordinates:geometry.coordinates }, minDistance: near.$minDistance,maxDistance: near.$maxDistance ,distanceField: "dist.calculated",spherical: true,num:100000000};
        delete  query["city"];
            gquery= [
             {$geoNear:geoquery},
             {$match: query},

            {
                $group: {
                    _id: null,
                    min: {$min: '$price'},
                    max: {$max: '$price'}
                }
            }
        ];
    }
    else{

               delete  query["category"];
               delete  query["loc"];
               delete  query["specSpecCategory"];
               delete  query["specCategory"];
              gquery= [

                         {$match: query},

                        {
                            $group: {
                                _id: null,
                                min: {$min: '$price'},
                                max: {$max: '$price'}
                            }
                        }
                    ];
    }





    Experiences.aggregate(gquery, function (err, results) {
        callback(err, results[0] || {min: 0, max: 0});
    });
}

// function isObjectId(n) {
//     return true;
//     //return mongoose.Types.ObjectId.isValid(n);
// }



module.exports = api;

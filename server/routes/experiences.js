var express = require('express');
var router = express.Router();
var fs = require('fs');
var imageData = require('../model/imageModel');
var experiences = require('../model/experiences');
var Comments = require('../model/comments');

router.get('/deleteExperiences/:id', function(req, res){

    experiences.find({'_id':req.params.id},{images:1}).lean().exec(function(err,result){
        if(result[0].images!=undefined)
            for(var i=0; i < result[0].images.length; i++)
                imageData.remove({'_id':result[0].images[i]}).lean().exec(function(err,data){
                    if(err)
                        console.log('unable to delete Image: '+err);
                });
        Comments.remove({'_roomID': req.params.id}).lean().exec(function(err, data){
            experiences.remove({'_id': req.params.id}, function(err, data){
                if(err)
                    console.log('Unable to Delete: '+err);
                else
                    res.json('success');
            });
        });
    });

});



router.post('/recordApproval/:id',function(req,res){

    experiences.update({'_id':req.body._id},{$set:{
        aktivStatus:true
    }}).lean().exec(function(err,docs){
        if(err)
            console.log('Unable to update record');
        else
            res.json('success');
    });
});

router.get('/ownExp/:id',function(req,res){

    experiences.find({'user':req.params.id}).lean().exec(function(err,result){
        if(err)
        {
            console.log('Unable to fetch Record:: '+err);
        }
        // else
        //     console.log(result)
            res.send(result);
    });
})

router.get('/imageCount/:id',function(req,res){
    experiences.find({'_id':req.params.id},{images:1}).lean().exec(function(err,result){
        if(err)
        {
            console.log('Unable to fetch Record:: '+err);
        }
        else
            res.send(result[0]);
    });

});


router.post('/editData',function(req,res){
    // console.log('editData trigger');
    // console.log(req.body);
    var imgId=[];
    imgId.push(req.body.images);
    experiences.update({'_id':req.body._id},{$set:{
        title:req.body.title,
        description:req.body.description,
        images:imgId
    }}).lean().exec(function(err,docs){
        if(err)
            console.log('Unable to edit record');
        else
            res.json('success');
    });
});

router.get('/edit/:id',function(req,res){
    experiences.find({'_id':req.params.id}).lean().exec(function(err,result){
        if(err)
        {
            console.log('Unable to fetch Record:: '+err);
        }
        else
            res.json(result[0]);
    });

});

module.exports = router;

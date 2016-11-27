var fs = require('fs');
var mongoose = require('mongoose');
var db = mongoose.connection;
var gridfs = require('./gridfs');
var Schema = mongoose.Schema;

var imageSchema = new Schema(
        {
            _id : Schema.Types.ObjectId,
            experienceId:String,
            type:String,
            files: [ Schema.Types.Mixed ]
        }
);

imageSchema.methods.addFile = function(path,filename,options,fn){
        upload = this;
        gridfs.putGridFileByPath(path, filename, options, function(err, result) {
        if (err) 
            console.log("UploadModel Upload Error: " + err);
        upload.files.push(result);
        return upload.save(fn);
    });
};

imageSchema.methods.addFiles = function(files, options, fn) {
    var upload,count,fpath;
    // var fileArray = [];
    upload = this;
    if(files.file.length==undefined) {
        gridfs.putGridFileByPath(files.file.path, files.file.name, options, function(err, result) {
            if (err) console.log("UploadModel Upload Error: " + err);
            upload.files.push(result);
            return upload.save(fn);
        });
    }
        
    else {

        count = files.file.length;
        for(var i=0; i<count; i++) {
            fpath = files.file[i].path;
            console.log('Path of File:: '+files.file[i].path);
            console.log('Name of File:: '+files.file[i].name);
            gridfs.putGridFileByPath(files.file[i].path, files.file[i].name, options, function(err, result) {
                if (err) console.log("UploadModel Upload Error: " + err);

                upload.files.push(result);
                if(count == upload.files.length)
                    return upload.save(fn);
            });
        }
    }
};

var image = mongoose.model("image", imageSchema);

module.exports = image;
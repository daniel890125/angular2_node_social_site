var email   = require('emailjs/email');

exports.sendmail = function(req, res) {
        
var server  = email.server.connect({
   user:    "daniel890125@gmail.com", 
   password:"password", 
   host:    "smtp.gmail.com", 
   ssl:     true
});
 
 console.log("Send Mail connected!!\n" + server);
// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    "You have signed up", 
   from:    "daniel890125@gmail.com", 
   to:      "daniel890125@gmail.com",
   subject: "Welcome to my app-!!!"
   // attachment: 
   // [
   //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
   //    {path:"pathtofile.zip", type:"application/zip", name:"renamed.zip"}
   // ]
}, function(err, message) { 
    if(err)
    console.log(err);
    else
    // res.json({success: true, msg: 'sent'});
  	console.log("ASDF");
 });
        
}

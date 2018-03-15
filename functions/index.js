

var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwa-project-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-project-cc81c.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function(request, response) {
 cors(request, response,function() {
   admin.database().ref('posts').push({
     id: request.body.id,
     title: request.body.title,
     location: request.body.location,
     image: request.body.image
   })
     .then(function() {
       webpush.setVapidDetails('mailto:nashchowdary@gmail.com',"BH5fBm_6adfs5sw03b8gBN5ArT8C7aZEV4ym2jvXtJ-lCbXTbl3XM8GuWa6jipGVkAVQ82_f3kLFnqcn3wLx0zs","cI7DoOq35TWwYaHwjRHu2d_IeJQcNAL5HR-OA-K_jfo")
       return admin.database().ref('subcriptions').once('value'); 
      
     })
     .then(function(subcriptions){
      subcriptions.forEach(function(sub){
        var pushconfig = {
          endpoint:sub.val().endpoint,
          keys:{
            auth:sub.val().keys.auth,
            p256dh:sub.val().keys.p256dh
          }
        }
        webpush.sendNotification(pushconfig,JSON.stringify({title:'New Post',content:"New post added!"}))
        .catch(function(err) {
          console.log(err);
        })
      });
      response.status(201).json({message: 'Data stored', id: request.body.id});   
      return null;    
     })
     .catch(function(err) {
       response.status(500).json({error: err});
     });
 });
});

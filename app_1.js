// -------------------------------------------------- //
// Module Dependencies
// -------------------------------------------------- //
var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var path = require('path');
var config = require('./config.js');              // Get our config info (app id and app secret)
var sys = require('util');
var OAuth = require('Oauth');
var OAuth1_0 = require('oauth-1.0a');

var app = express();
var desk = require('desk.js');
// -------------------------------------------------- //
// Express set-up and middleware
// -------------------------------------------------- //
app.set('port', config.PORT);
app.use(cookieParser());                                    // cookieParser middleware to work with cookies
app.use(express.static(__dirname + '/public'));

// -------------------------------------------------- //
// Variables
// -------------------------------------------------- //
var clientID = config.CLIENT_ID
var clientSecret = config.CLIENT_SECRET
var callbackUrl = config.HOSTPATH + ":" + config.PORT + "/oauthCallback";
var result = '';
var multiple_requests = false;
var pagination_limit_exceeded = false;
var total_pages_to_process = 0;

    var OAuth = OAuth.OAuth;
    var oauth = new OAuth(
    'https://doba.desk.com/api/v2/oauth/request_token',
    'https://doba.desk.com/api/v2/oauth/access_token',
    clientID,
    clientSecret,
    '1.0',
    callbackUrl,
    'HMAC-SHA1'
    );

// -------------------------------------------------- //
// Routes
// -------------------------------------------------- //

app.get('/', function(req, res) {
  console.log('hi')
  res.redirect('/requesttoken');
});

// Get a request token
app.get('/requesttoken', function(req, res) {
  console.log('inside requesting');

    console.log('created client');
    oauth.getOAuthRequestToken(
      function(error, oauth_token, oauth_token_secret, results)
      {
          if(error) {
            console.log("error: " + error1);
          }
          else {
            res.cookie("oauthToken", oauth_token);
            res.cookie("oauthTokenSecret", oauth_token_secret);
            res.redirect('https://doba.desk.com/api/v2/oauth/authorize?oauth_token=' + oauth_token);
          }
      }
    );
 });

 // Once the user authorizes the WDC to use their
 // Desk account we get redirected here.
app.get('/oauthCallback?', function(req, res) {

    var oauth_verifier = req.query['oauth_verifier'];

    oauth.getOAuthAccessToken(
        req.cookies.oauthToken,
        req.cookies.oauthTokenSecret,
        oauth_verifier,
        function(error, oauth_access_token, oauth_access_token_secret, results)
        {
          if(error) {
            console.log("error: " + error);
          }
          else {
            res.cookie("accessToken", oauth_access_token);
            res.cookie("accessTokenSecret", oauth_access_token_secret);
            res.redirect('/index.html');
          }
        }
    );
 });

  // Call the DESK API
  app.get('/callapi', function(req, res) {
  console.log('InsideCAllAPI');
  client = desk.createClient({
    subdomain: 'doba',
    // optional include only if you use a custom domain - see below for details
    endpoint: 'https://doba.desk.com',
    // use it with basic auth
    username: 'mvijayakumar@doba.com',
    password: 'JesusDesk1!',
    // use it with oauth
    consumerKey: 'VlqPp7wQVajRE7TG2v6c',
  consumerSecret: 'leaaq9sJ6nZnGU3QnIdnC4Voq9tkhqcWW3uZR0tQ',
  token: 'Al89NjDzSEGI59dNV3RD',
  tokenSecret: 'v8nohMeqGB1Xbna3mKFCzWtp0VkYQVdPWPaYqQws',
    // add a request logger
    logger: console,
    // allow retry
    retry: true
  });
  var result2 = '';
   /*result2 = */fetchResult(req.query.passThroughUrl,1,1);
   function fetchResult(url, idParameter, pageNumber){
     //console.log(url+id+'&page='+pageNumber+'&per_page=100');
     console.log('Hi');
     console.log(url,idParameter);
     client.get(url+idParameter+'&page='+pageNumber+'&per_page=100', function(err, json, response) {
     if (err) throw err;
     // the json is the response body already parsed
     var obj = JSON.stringify(json._embedded.entries);
     result = result.concat(obj);
    // console.log(obj);
     //console.log(json._links.last.href);
   //return result;
     total_pages_to_process =  findPages(json,'last');

     if (total_pages_to_process > 1) {multiple_requests = true;}
     if (total_pages_to_process>500) {
       pagination_limit_exceeded = true;
       total_pages_to_process  = 25;
     }
     //console.log(total_pages_final);
     console.log(total_pages_to_process);
     console.log(multiple_requests);
       /*var result1= */howMany(total_pages_to_process,idParameter);
       //return result1;

     //console.log(obj);
   });
   }


   function howMany(total_pages_to_process,sinceID) {

   for (var i = 2; i <= total_pages_to_process; i++) {
     console.log('inside the loop');
     client.get('/api/v2/cases/search?since_id='+sinceID+'&per_page=100&page='+i, function(err, json, response) {
       if (err) throw err;
       var obj = JSON.stringify(json._embedded.entries);
       result = result.concat(obj);
       var page = findPages(json,'self');
       if (page == 500){
         console.log("Hi PAGE 500, Inside the page");
         var id = 0;
         var object = json._embedded.entries;
         for(var i=0;i<object.length;i++){
           console.log(object.length);
           console.log(i);
           console.log(object[i].id);
           id = object[i].id;
         }
         console.log('The maximum ID is '+ id);
         if(id >0){
           fetchResult('/api/v2/cases/search?since_id=',id,1);
         }
       }
       else if (total_pages_to_process = page) {
         console.log('Im inside the loop');
         res.write(result, function(){
            res.end();
         });

         return;
       }
       //res.write(result);
       //return result;
       //writeResult(result);
      //console.log(result);
  // return result;
     });
     //console.log('Completed link number'+i);
   }
   }
    // client.get(req.query.passThroughUrl, function(err, json, response) {
    //   if (err) {
    //     console.log("Error : " + error);
    //   }
    //   else {
    //     var obj = JSON.stringify(json);




    //res.write(result2);
    //   };

    // });



    // request({
    //   url: reqData.url,
    //   method: reqData.method,
    //   form: auth.authorize(reqData, token)
    // }, function(error, response, body)
    // {
    //   if(!error)
    //   {
    //     res.write(body);
    //   }
    //   else
    //     console.log("Error : " + error);
    //
    //   res.end();
    //   return;
    // });
 });


 function findPages(jsonresponse,position){
  //console.log(jsonresponse);
  //console.log(position);
  if(position === 'last'){
    var last_page = jsonresponse._links.last.href;
  }
  else
  {
    var last_page = jsonresponse._links.self.href;
  }

    var index_page = last_page.indexOf('page=');
    var total_pages = last_page.substring(index_page+5,index_page+10);
    var total_pages_final = total_pages.replace(/[^0-9]/g,'');
    return total_pages_final;
}


// -------------------------------------------------- //
// Create and start our server
// -------------------------------------------------- //
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

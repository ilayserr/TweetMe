/*
This is Ilay Serr solution for the RapidApi test
File Name : server.js
Author : Ilay Serr
Email : ilay92@gmail.com
*/

// Initiate variables and require statments
var express = require('express');
var app = express();
var Twit = require('twit');
var config = require('./config')
var bodyParser = require('body-parser');
var Twitter = new Twit(config);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 5000;

// Set the view enjine HTML
app.set(express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Make express look in the public directory for 'style.css'
app.use(express.static(__dirname + '/public'));

// Set the home page route
app.get('/', function(req, res) {
   	res.render('index');
});

// Post a tweet according to the user input
app.post('/send_tweet', function (req, res) {
  
  // Handling the data from the user
  var data = req.body.status;
	var tweet = {status: data };

  // Using the twitter api inorder to post a tweet
	Twitter.post('statuses/update', tweet, tweeted)
	
  // Leting the user know if the tweet succedded or not
  function tweeted(err, data, response) {
		if(err) {
      res.send("The tweet didn't work!");
		} else {
      res.send('The tweet worked');
		}
	} 
});


// Get tweets according to the user input
app.get('/get_tweets', function(req, res){
  
  // Handling the data from the user
  var data1 = req.query.search_word;
  if (data1 == "") return;
  var numStatuses = req.query.num_search;
  if (numStatuses < 0) return;
  
  // Using the twitter api inorder to get tweets back
  Twitter.get('search/tweets', { q: data1, count: numStatuses }, function(err, data, response) {
    var tweets = data.statuses;
    if (tweets.length < numStatuses) {
      numStatuses = tweets.length;
      if (numStatuses == 0) return;
    } 
    var result = [];

    // Presenting the relevant data
    for (var i = 0; i < numStatuses; i++) {
      console.log(tweets[i].entities.hashtags);
      result = 'user name:  ' + tweets[i].user.screen_name + 
               '\nposted on:  ' + tweets[i].created_at +
               '\npost:       ' + tweets[i].text + "\n\n";
      res.write(result);
      
    }
    res.end();
  })
});

// Get tweets according to the user input
app.get('/get_hashtags', function(req, res){
  
  // Handling the data from the user
  var data1 = req.query.search_hashtag;
  if (data1 == "") return;

  // Using the twitter api inorder to get tweets back
  // This is according to the last 10,000 tweets
  Twitter.get('search/tweets', { q: data1, count: 10000 }, function(err, data, response) {
    var tweets = data.statuses;
    var numStatuses = tweets.length;
    if (numStatuses == 0) return;
    var result = [];
    var maxNum = 11;

    // moving all hashtags into an array
    for (var i = 0; i < numStatuses; i++) {
      var numOfHashtags = tweets[i].entities.hashtags.length;
      for(var j = 0; j < numOfHashtags; j++) {
        result.push(tweets[i].entities.hashtags[j].text);
      }
    }
    if (result.length < maxNum) maxNum = result.length;
    // creating an object with count for each hashtag
    var obj = {};
    for (var i = 0, j = result.length; i < j; i++) {
      obj[result[i]] = (obj[result[i]] || 0) + 1;  
    }

    // getting the keys with the highest values
    function getKeysWithHighestValue(obj, n){
      var keys = Object.keys(obj);
      keys.sort(function(a,b){
        return obj[b] - obj[a];
      })
      return keys.slice(0,n);
    } 
    
    // took 11 values inorder to exclude the hashtag we searched
    topten = getKeysWithHighestValue(obj, maxNum);
    res.write("The " + (maxNum - 1) + " most similiar hashtags to " + req.query.search_hashtag + " are:\n")
    for (var i = 1; i < maxNum; i++) {
      res.write(topten[i] + "\n");
    }
    res.end();
  })
});

// Let us listen to the port we want
app.listen(port, function() {
    console.log('TweetMe app is running on http://localhost:' + port);
});

module.exports = app;


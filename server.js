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
var port = process.env.PORT || 8080;

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
      result = 'user name:  ' + tweets[i].user.screen_name + 
               '\nposted on:  ' + tweets[i].created_at +
               '\npost:       ' + tweets[i].text + "\n\n";
      res.write(result);
      
    }
    res.end();
  })
});

// Let us listen to the port we want
app.listen(port, function() {
    console.log('TweetMe app is running on http://localhost:' + port);
});

module.exports = app;


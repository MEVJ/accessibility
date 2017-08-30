
'use strict';
var express = require('express');
var favicon = require('serve-favicon');
var helmet = require('helmet')
var path = require('path');
var bodyParser = require('body-parser');
var pa11y = require('pa11y');
var automate = require('./automate/automate.json');


var app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var router = express.Router();
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));

});

app.use('/api', router);

var test = pa11y({
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	},

	beforeScript: function(page, options, next) {

		function waitUntil(condition, retries, waitOver) {
			page.evaluate(condition, function(error, result) {
				if (result || retries < 1) {
					// Once the changes have taken place continue with Pa11y testing
					waitOver();
				} else {
					retries -= 1;
					setTimeout(function() {
						waitUntil(condition, retries, waitOver);

					}, 2000);
				}
			});
		}

		// The script to manipulate the page must be run with page.evaluate to be run within the context of the page

    page.evaluate(function() {
			var user = document.querySelector('#username');
			var password = document.querySelector('#password');
			var submit = document.querySelector('#submit');

			user.value = 'exampleUser';
			password.value = 'password1234';

			//submit.click();

		}, function() {

			// Use the waitUntil function to set the condition, number of retries and the callback
			waitUntil(function() {
        var elementExists = document.getElementById("signin_body");
        if(elementExists){
          return true;
        }else{
          return false;
        }



				//return window.location.href === 'http://example.com/myaccount';
			}, 100, next);
		});

	}

});


router.route('/run').get(function(req, res) {


  test.run('http://localhost:3000/apps/auth/signin/', function(error, result) {
    if (error) {
      //return console.error(error.message);
      res.send(error.message);
    }else{
      res.send(result);
    }

  });

});


var server = app.listen(3000, function() {
    console.log('api listening on', server.address().port);

});

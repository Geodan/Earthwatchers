// Get the packages we need
var express = require('express');
var path = require('path');
var dotenv = require('dotenv');

// Create our Express application
var app = express();
dotenv.load();
console.log("environment: " + process.env.SENDGRID_USERNAME);

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Create our Express router
var router = express.Router();

// Initial dummy route for testing
// http://localhost:3000/api
router.get('/', function(req, res) {
  res.json({ message: 'Earthwatchers serverside' });
});

router.get('/version', function(req, res) {
  res.json({ message: 'Version 0.2' });
});


// Register all our routes with /api
app.use('/api', router);
// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'app')));


// Start the server
app.listen(port);
console.log('Earthwatchers started on port ' + port);
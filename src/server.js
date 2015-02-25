var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var fs = require('fs');
var turf = require('turf');
var morgan = require('morgan');


var expressLogFile = fs.createWriteStream(__dirname + '/express.log', {flags: 'a'});

var app = express();
app.use(morgan('combined', {stream: expressLogFile}))
dotenv.load();

var port = process.env.PORT || 3000;
var router = express.Router();

router.get('/', function(req, res) {
  // todo: return root document
  res.json({ message: 'Earthwatchers serverside' });
});

router.get('/version', function(req, res) {
  res.json({ message: 'Version 0.2' });
});

// spatial select the stalliteimages that intersect with client envelope
router.get('/satelliteimages', function(req, res) {
	// todo: add parameters
	var polygonClient = turf.polygon([[
		[ 110.45623613600009, -0.947576260999938 ], 
		[ 110.45623613600009, 0.941824488000066 ], 
		[ 112.6727473310001, 0.941824488000066 ], 
		[ 112.6727473310001, -0.947576260999938 ], 
		[ 110.45623613600009, -0.947576260999938 ]
	]]);

    var satelliteimages = fs.readFileSync('satelliteimages.geojson','utf8');
    var jsonSatelliteImages = JSON.parse(satelliteimages);
    var selectedSatelliteImages = [];
    for (var f in jsonSatelliteImages.features) {
    	var intersection = turf.intersect(jsonSatelliteImages.features[f], polygonClient);
    	if(intersection!=null)
    	{
    		selectedSatelliteImages.push(jsonSatelliteImages.features[f]);
    	}
	}
	res.json(turf.featurecollection(selectedSatelliteImages));
  }
);

app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
app.listen(port);
console.log('Earthwatchers server started on port ' + port);
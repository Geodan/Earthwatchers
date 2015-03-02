var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var fs = require('fs');
var turf = require('turf');
var morgan = require('morgan');

var imageTypes = { 'EVI': 0, 'Infrared': 1, 'TrueColor': 2, 'Aerial': 3, 'SAR': 4 };

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
// example request: /api/satelliteimages?bbox=111.68114616674286,0.14783529583901883,111.69333942996492,0.158394933823336&imagetype=Aerial
router.get('/satelliteimages', function (req, res) {
    var bboxPar = req.query.bbox;
    var imageType = req.query.imagetype;
    if (bboxPar != null || imageType!=null) {
        var imageTypeNr =  imageTypes[imageType];
        
        var bbox = bboxPar.split(',');
        for (var i = 0, len = bbox.length; i < len; i++) {
            bbox[i] = parseFloat(bbox[i]);
        }
        var poly = turf.bboxPolygon(bbox);
        console.log('poly: ' + poly);

        var satelliteimages = fs.readFileSync('satelliteimages.geojson', 'utf8');
        var jsonSatelliteImages = JSON.parse(satelliteimages);
        var selectedSatelliteImages = [];
        for (var f in jsonSatelliteImages.features) {
            var intersection = turf.intersect(jsonSatelliteImages.features[f], poly);
            if (intersection != null) {
                if (jsonSatelliteImages.features[f].properties.ImageType == imageTypeNr) {
                    selectedSatelliteImages.push(jsonSatelliteImages.features[f]);
                }
            }
        }
        res.json(turf.featurecollection(selectedSatelliteImages));

    } else {
        res.status(404).send('Error: Parameter bbox not specified');
    }
  }
);

app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
app.listen(port);
console.log('Earthwatchers server started on port ' + port);
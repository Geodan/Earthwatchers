var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var fs = require('fs');
var turf = require('turf');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var HttpStatus = require('http-status-codes');

var imageTypes = { 'Landsat': 2, 'Sentinel': 4 };

var expressLogFile = fs.createWriteStream(__dirname + '/express.log', {flags: 'a'});

var app = express();
app.use(morgan('combined', {stream: expressLogFile}));
var jsonParser = bodyParser.json();
app.use(expressValidator());
app.disable('x-powered-by');
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
// example request:
// /satelliteimages?bbox=111.68,0.14,111.69,0.15&imagetype=Landsat
router.get('/satelliteimages', function (req, res) {
    var bboxPar = req.query.bbox;
    var imageType = req.query.imagetype;
    if (bboxPar !== null || imageType!==null) {
        var imageTypeNr =  imageTypes[imageType];
        
        var bbox = bboxPar.split(',');
        for (var i = 0, len = bbox.length; i < len; i++) {
            bbox[i] = parseFloat(bbox[i]);
        }
        var poly = turf.bboxPolygon(bbox);

        var satelliteimages = fs.readFileSync('satelliteimages.geojson', 'utf8');
        var jsonSatelliteImages = JSON.parse(satelliteimages);
        var selectedSatelliteImages = [];
        for (var f in jsonSatelliteImages.features) {
            var intersection = turf.intersect(jsonSatelliteImages.features[f], poly);
            if (intersection != null) {
                if (jsonSatelliteImages.features[f].properties.ImageType === imageTypeNr) {
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

router.post('/observations', jsonParser, function (req, res) {
    req.checkBody('user', 'User is required').notEmpty();
    //req.checkBody('lat', 'lat is required').notEmpty();
    //req.checkBody('lon', 'lon is required').notEmpty(); 
    //req.checkBody('geohex', 'geohex is required').notEmpty();
    //req.checkBody('observation', 'observation is required').notEmpty();
    // var nowIso = dateFormat(now, "isoDateTime");

    var errors = req.validationErrors();

    if (errors===null){
        // todo: store in db (file for now)
        req.body.date= new Date().toISOString();

        // send back complete resource 
        res.status(HttpStatus.CREATED).send(req.body);
    }
    else{
        res.status(HttpStatus.NOT_FOUND).send("request validation error:");
    } 
});


app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
var server = app.listen(port);
module.exports = server;
console.log('Earthwatchers server started on port ' + port);
var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var fs = require('fs');
var turf = require('turf');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var HttpStatus = require('http-status-codes');
var lineReader = require('line-reader');
var uuid = require('node-uuid');
var nosql = require('nosql');

var imageTypes = {
    'Landsat': 2,
    'Sentinel': 4
};

// var observationsFile = 'ew_observations.txt';
var expressLogFile = fs.createWriteStream(__dirname + '/express.log', {
    flags: 'a'
});

var app = express();
app.use(morgan('combined', {
    stream: expressLogFile
}));
var jsonParser = bodyParser.json();
app.use(expressValidator());
app.disable('x-powered-by');
dotenv.load();

var port = process.env.PORT || 3000;
var host = process.env.LOCALHOST || 'localhost';
console.log('host: ' + process.env.localhost);

var dbObservations=nosql.load('./db/ew_observations.nosql');
dbObservations.description('Earthwatchers observations.');

var router = express.Router();

router.get('/', function (req, res) {
    // todo: return root document
    res.json({
        message: 'Earthwatchers serverside'
    });
});

router.get('/version', function (req, res) {
    res.json({
        message: 'Version 0.2'
    });
});

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

router.get('/hexagons/:id', nocache, function (req, res) {
    var hex = req.params.id;
    var username = req.query.user;
    // get stats for the given hexagon
});

// spatial select the stalliteimages that intersect with client envelope
// example request:
// /satelliteimages?bbox=111.68,0.14,111.69,0.15&imagetype=Landsat
router.get('/satelliteimages', function (req, res) {
    var bboxPar = req.query.bbox;
    var imageType = req.query.imagetype;
    if (bboxPar !== null || imageType !== null) {
        var imageTypeNr = imageTypes[imageType];

        var bbox = bboxPar.split(',');
        for (var i = 0, len = bbox.length; i < len; i++) {
            bbox[i] = parseFloat(bbox[i]);
        }
        var poly = turf.bboxPolygon(bbox);

        var satelliteimages = fs.readFileSync(__dirname +'/satelliteimages.geojson', 'utf8');
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
        res.status(HttpStatus.NOT_FOUND).send('Error: Parameter bbox not specified');
    }
});

router.post('/observations', jsonParser, function (req, res) {
    var id = uuid.v4(); 
    req.checkBody('user', 'User is required').notEmpty();
    req.checkBody('lat', 'lat is required').notEmpty();
    req.checkBody('lon', 'lon is required').notEmpty();
    req.checkBody('geohex', 'geohex is required').notEmpty();
    req.checkBody('observation', 'observation is required').notEmpty();
    req.checkBody('project', 'project is required').notEmpty();

    var errors = req.validationErrors();

    if (errors === null) {
        req.body.date = new Date().toISOString();
        req.body.id = id;

        dbObservations.insert(req.body, function(err, count){
            console.log('new observation is saved');
            res.status(HttpStatus.CREATED).send(req.body);
        });
    } else {
        res.status(HttpStatus.NOT_FOUND).send("request validation error:" + errors);
    }
});

router.put('/observations', jsonParser, function (req, res) {
    req.checkBody('id', 'Id is required').notEmpty();
    req.checkBody('lat', 'lat is required').notEmpty();
    req.checkBody('lon', 'lon is required').notEmpty();

    var errors = req.validationErrors();
    console.log ('http put rocks!');

    if (errors === null) {
        var id = req.body.id;

        if (fs.exists(observationsFile, function(res){
            lineReader.eachLine(observationsFile, function (line, last) {
                console.log('line:'+line);
                var json = JSON.parse(line);
                if(json.id===id){
                    json.lat=req.body.lat;
                    json.lon=req.body.lon;
                    json.date=new Date().toISOString();

                    //and now save
                    console.log('fix it!');
                    //fs.writeFile(observationsFile,JSON.stringify(json)+'\n', function(err) {
                    //    err || console.log('Data replaced!', json);
                    //});
                }
            });
        }));

        // send back complete resource 
        res.status(HttpStatus.OK).send(req.body);
    } else {
        res.status(HttpStatus.NOT_FOUND).send("request validation error:" + errors);
    }
});



app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
var server = app.listen(port, host);
module.exports = server;
console.log('Earthwatchers server started on port http://' + host + ':' + port);

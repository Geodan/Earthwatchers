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
var dbObservations=nosql.load('./db/ew_observations.nosql');
dbObservations.description('Earthwatchers observations.');

var router = express.Router();

//TODO where to put this
function arraySearch(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return i;
        }
    }
    return -1;
}

router.get('/', function (req, res) {
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

router.get('/observations/:project', nocache, function (req, res) {
    // sampleurl : observations/Borneo
    var projectName = req.params.project;
    //var username = req.params.username;
    console.log('request observations for project: ' + projectName);

    var observations = 0;
    var users = [];
    var hexagons = [];

    dbObservations.each(function (observation) {
        if (observation.project === projectName) {
            //search for unique users
            if (arraySearch(users, observation.user) === -1) {
                users.push(observation.user);
            }

            //search for unique hexagons
            if (arraySearch(hexagons, observation.geohex) === -1) {
                hexagons.push(observation.geohex);
            }
            observations++;
        }
    }, function (err) {
        console.log('observations:' + observations + ', hexagons:' + hexagons.length + ', users: ' + users.length);
        var returnObject = {
            "project": projectName,
            "observations": observations,
            "hexagons": hexagons,
            "users": users
        };
        res.status(HttpStatus.OK).send(returnObject);
    });
});



router.get('/observations/:project/:geohexcode/:username', nocache, function (req, res) {
    // sampleurl : observations/Borneo/PO2632/bert
    var project = req.params.project;
    var geohexcode = req.params.geohexcode;
    var username = req.params.username;
    console.log('request observations for project: ' + project + ', geohexcode:' + geohexcode + ', username: ' + username );

    dbObservations.all(function(doc) {
        return (doc.project === project && doc.geohex === geohexcode && doc.user === username);
    }, function(error,selected){
        res.status(HttpStatus.OK).send(selected);
    });
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
            console.log(req.body.date + ': added user: ' + req.body.user + ', hexagon: ' + req.body.geohex + ', project: ' + req.body.project + ', observation: ' + req.body.observation );
            res.status(HttpStatus.CREATED).send(req.body);
        });
    } else {
        res.status(HttpStatus.NOT_FOUND).send("request validation error:" + errors);
    }
});


router.delete('/observations/:id', function (req, res) {
    var id = req.params.id;
    console.log('delete observation id: ' + id);
    dbObservations.remove(function(doc) {
        return (doc.id === id);
    }, function(error,count){
        res.status(HttpStatus.OK).send(req.body);
    }
    );
});

router.put('/observations', jsonParser, function (req, res) {
    req.checkBody('id', 'Id is required').notEmpty();
    req.checkBody('lat', 'lat is required').notEmpty();
    req.checkBody('lon', 'lon is required').notEmpty();

    var errors = req.validationErrors();

    if (errors === null) {
        var id = req.body.id;
        console.log('update observation: ' + id);

        dbObservations.update(function(doc) {
            if (doc.id === id){
                doc.date = new Date().toISOString();
                doc.lat=req.body.lat;
                doc.lon=req.body.lon;
            }

            return doc;
        }, function(error,count){
            res.status(HttpStatus.OK).send(req.body);
        }
        );


    } else {
        res.status(HttpStatus.NOT_FOUND).send("request validation error:" + errors);
    }
});



app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
var server = app.listen(port);
module.exports = server;
console.log('Earthwatchers server started on port ' + port);




/**
 * gets a random hexagon within a project
 */
function getRandomHexagon(project, geohexlevel) {
    var isInside = false;
    var env = turf.envelope(project);
    var bbox = env.geometry.coordinates[0];

    while (!isInside) {
        var lon_rnd = random(bbox[0][0], bbox[1][0]);
        var lat_rnd = random(bbox[0][1], bbox[2][1]);
        // check if point is inside polygon
        var pt = turf.point([lon_rnd, lat_rnd]);
        isInside = turf.inside(pt, project);
    }
    return GEOHEX.getZoneByLocation(lat_rnd, lon_rnd, geohexlevel).code;
}


function getGeohexPolygon(geohexCode, style) {
    var zone = GEOHEX.getZoneByCode(geohexCode);
    return L.polygon(zone.getHexCoords(), style);
}


function isPointInHexagon(geohexcode, latlng) {
    var pt = turf.point([latlng.lng, latlng.lat]);
    var poly = getGeohexPolygon(geohexcode, null);
    return turf.inside(pt, poly.toGeoJSON());
}


function drawHexagon(map, geohexCode) {
    var myStyle = {
        'color': '#000000',
        'weight': 5,
        'opacity': 0.65,
        fillOpacity: 0
    };

    var polygon = getGeohexPolygon(geohexCode, myStyle);
    var centerHex = polygon.getBounds().getCenter();
    map.setView(centerHex, startZoomLevel, {
        animation: true
    });
    polygon.name = 'hexagon';
    map.addLayer(polygon);
    return polygon;
}

//TODO where to put this
function arraySearch(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return i;
        }
    }
    return -1;
}

function getTotalHexagons() {
    console.log(project);
    console.log(defaultGeohexLevel);
    var startHexagon = getRandomHexagon(project, defaultGeohexLevel);
    var zone = GEOHEX.getZoneByCode(startHexagon);
    var allHexagons = [zone.code];
    return getNeighbourHexagon(allHexagons, zone);
}

function getNeighbourHexagon(allHexagons, zone) {
    var neighbours = getSixNeighbours(zone);

    for (var i = 0; i < neighbours.length; i++) {
        if (arraySearch(allHexagons, neighbours[i].code) === -1) {
            if (hexagonInsideProject(neighbours[i])) {
                allHexagons.push(neighbours[i].code);
                getNeighbourHexagon(allHexagons, neighbours[i]);
            }
        }
    }
    return allHexagons;
}

function getSixNeighbours(zone) {
    return [
        getHexagonUp(zone),
        getHexagonUpLeft(zone),
        getHexagonDownLeft(zone),
        getHexagonDown(zone),
        getHexagonDownRight(zone),
        getHexagonUpRight(zone)
    ];
}

function getHexagonUp(zone) {
    return getHexagonNeighbour(zone.x + 1, zone.y + 1);
}
function getHexagonDownRight(zone) {
    return getHexagonNeighbour(zone.x, zone.y - 1);
}

function getHexagonDownLeft(zone) {
    return getHexagonNeighbour(zone.x - 1, zone.y);
}

function getHexagonUpRight(zone) {
    return getHexagonNeighbour(zone.x + 1, zone.y);
}

function getHexagonDown(zone) {
    return getHexagonNeighbour(zone.x - 1, zone.y - 1);
}

function getHexagonUpLeft(zone) {
    return getHexagonNeighbour(zone.x, zone.y + 1);
}


function getHexagonNeighbour(x, y) {
    return GEOHEX.getZoneByXY(x, y, defaultGeohexLevel);
}


function hexagonInsideProject(hexagon) {
    var coordinates = hexagon.getHexCoords();
    for (var i = 0; i < coordinates.length; i++) {
        var point = turf.point([coordinates[i].lon, coordinates[i].lat]);
        if (turf.inside(point, project)) {
            return true;
        }
    }
    return false;
}

function getHexagonNavigation(geohexCode, maplocal) {
    //bepalen buren binnen project
    var currentHexagon = GEOHEX.getZoneByCode(geohexCode);
    var coordinatesCurrentHexagon = currentHexagon.getHexCoords();
    var allHexagons = getSixNeighbours(currentHexagon);

    console.log(coordinatesCurrentHexagon);
//    for (var i = 0; i < 1; i++) {
    for (var i = 0; i < allHexagons.length; i++) {
        if (hexagonInsideProject(allHexagons[i])) {
            drawHexagon(maplocal, allHexagons[i].code);

            var points = getMixedPoints(currentHexagon, allHexagons[i]);
            console.log(points);

            var pointA = points[0];
            var pointB = points[1];

            var calculatedLat = (pointA[0] + pointB[0]) / 2;
            var calculatedLon = (pointA[1] + pointB[1]) / 2;

            var ll = new L.LatLng(calculatedLat, calculatedLon);
            var newMarker = new L.marker(ll);
            newMarker.id = "nav" + i;
            newMarker.addTo(maplocal);


//            //bepalen snijpunt met buur
//            var test = turf.intersect(getGeohexPolygon(currentHexagon, null).toGeoJSON(),getGeohexPolygon(allHexagons[i], null).toGeoJSON());
//
//            console.log("test");
//            console.log(test);
//            if (test) {
//
//                var ll = new L.LatLng(test.geometry.coordinates[1], test.geometry.coordinates[0]);
//                var newMarker = new L.marker(ll);
//                newMarker.id = "nav" + i;
//                newMarker.addTo(maplocal);
//            }
        }
    }
    //tekeken snijpunt met link naar buur (url + geohexcode)

}

function getMixedPoints(hexagonA, hexagonB) {
    var precision = 4;
    var coordinatesHexagonA = hexagonA.getHexCoords();
    var coordinatesHexagonB = hexagonB.getHexCoords();

//    console.log(coordinatesHexagonA);
//    console.log(coordinatesHexagonB);

    var points = [];
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {

            if (coordinatesHexagonA[i].lat.toFixed(precision) === coordinatesHexagonB[j].lat.toFixed(precision) &&
                coordinatesHexagonA[i].lon.toFixed(precision) === coordinatesHexagonB[j].lon.toFixed(precision)) {
                console.log(i + '-' + j);
                var point = [coordinatesHexagonA[i].lat, coordinatesHexagonA[i].lon];
                points.push(point);
            }
        }
    }
    return points;
}
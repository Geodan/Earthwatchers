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

function drawHexagons(map, hexagons) {
    for (var i = 0; i < hexagons.length; i++) {
        drawHexagon(map, hexagons[i], 1);
    }
}


function drawHexagon(map, geohexCode, styleNumber) {

    var polygonName = "hexagon" + geohexCode;
    //Current Hexagon
    var style = {
        color: " #000000" ,
        weight: 5,
        opacity: 0.65,
        label: geohexCode,
        fillOpacity: 0
    };

    if (styleNumber === 1) {
        //allHexagons
        style.weight = 1;
        style.color = " #FFFFFF" ;

    }

    var polygon = getGeohexPolygon(geohexCode, style);

    polygon.name = polygonName;
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

    var currentHexagon = GEOHEX.getZoneByCode(geohexCode);

    showNavigationTriangle(currentHexagon, getHexagonUp(currentHexagon), [0, 15], false, maplocal);
    showNavigationTriangle(currentHexagon, getHexagonDown(currentHexagon), [0, -15], true, maplocal);
    showNavigationTriangle(currentHexagon, getHexagonUpLeft(currentHexagon), [10, 5], true, maplocal);
    showNavigationTriangle(currentHexagon, getHexagonDownLeft(currentHexagon), [10, -5], false, maplocal);
    showNavigationTriangle(currentHexagon, getHexagonUpRight(currentHexagon), [-10, 5], true, maplocal);
    showNavigationTriangle(currentHexagon, getHexagonDownRight(currentHexagon), [-10, -5], false, maplocal);
}

function showNavigationTriangle(currentHexagon, neighbourHexagon, offset, downward, maplocal) {
    if (hexagonInsideProject(neighbourHexagon)) {
        var points = getMixedPoints(currentHexagon, neighbourHexagon);

        var latLonPoints = getCalculatedCenter(points);
        var latLon = new L.LatLng(latLonPoints[0], latLonPoints[1]);

        addNavigationMarker(latLon, offset, downward, neighbourHexagon.code, maplocal);

//        drawHexagon(maplocal, neighbourHexagon.code, 2);
    }
}

function getMixedPoints(hexagonA, hexagonB) {

    var precision = 4;
    var coordinatesHexagonA = hexagonA.getHexCoords();
    var coordinatesHexagonB = hexagonB.getHexCoords();
    var points = [];
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {

            if ((coordinatesHexagonA[i].lat.toFixed(precision) === coordinatesHexagonB[j].lat.toFixed(precision) ||
                //check for coordinates around 0 (precision results in -0.000000 and 0.00000)
                (Math.abs(coordinatesHexagonA[i].lat) < 0.0000001 && Math.abs(coordinatesHexagonB[j].lat) < 0.0000001)) &&
                (coordinatesHexagonA[i].lon.toFixed(precision) === coordinatesHexagonB[j].lon.toFixed(precision) ||
                    //check for coordinates around 0 (precision results in -0.000000 and 0.00000)
                    (Math.abs(coordinatesHexagonA[i].lon) < 0.0000001 && Math.abs(coordinatesHexagonB[j].lon) < 0.0000001))) {
                var point = [coordinatesHexagonA[i].lat, coordinatesHexagonA[i].lon];
                points.push(point);
            }
        }
    }
    return points;
}

function getCalculatedCenter(points) {
    var pointA = points[0];
    var pointB = points[1];

    var calculatedLat = (pointA[0] + pointB[0]) / 2;
    var calculatedLon = (pointA[1] + pointB[1]) / 2;

    return [calculatedLat, calculatedLon];
}

function addNavigationStyle(geohex) {
    var layer = findLayerByName("hexagon" + geohex);
    if (layer) {
        layer.setStyle({
            weight: 3,
            fillOpacity: 0.1,
            color: "black"
        });

    }
}

function addCurrentHexagonStyle(geohex) {
    var layer = findLayerByName("hexagon" + geohex);
    if (layer) {
        console.log(geohex);
        layer.setStyle({
            weight: 5,
            fillOpacity: 0,
            color: "black"
        });

    }
}

function removeStyles(geohex) {
    if (geohex !== geohexCode) { //prevent removing style from new selected hexagon
        var layer = findLayerByName("hexagon" + geohex);
        if (layer) {
            layer.setStyle({
                weight: 1,
                fillOpacity: 0,
                color: "white"
            });
        }
    }
}
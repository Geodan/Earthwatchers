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

    var sixNeighbours = [];
    sixNeighbours.push(GEOHEX.getZoneByXY(zone.x - 1, zone.y, defaultGeohexLevel));
    sixNeighbours.push(GEOHEX.getZoneByXY(zone.x - 1, zone.y + 1, defaultGeohexLevel));

    sixNeighbours.push(GEOHEX.getZoneByXY(zone.x, zone.y - 1, defaultGeohexLevel));
    sixNeighbours.push(GEOHEX.getZoneByXY(zone.x, zone.y + 1, defaultGeohexLevel));

    sixNeighbours.push(GEOHEX.getZoneByXY(zone.x + 1, zone.y - 1, defaultGeohexLevel));
    sixNeighbours.push(GEOHEX.getZoneByXY(zone.x + 1, zone.y, defaultGeohexLevel));

    return sixNeighbours;
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

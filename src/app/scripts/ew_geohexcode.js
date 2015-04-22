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
    geohexCode = GEOHEX.getZoneByLocation(lat_rnd, lon_rnd, geohexlevel).code;
    return geohexCode;
}


function getGeohexPolygon(geohexCode, style) {
    var zone = GEOHEX.getZoneByCode(geohexCode);
    return L.polygon(zone.getHexCoords(), style);
}


function isPointInHexagon(geohexcode, latlng){
    var pt = turf.point([latlng.lng, latlng.lat]);
    var poly=getGeohexPolygon(geohexcode, null); 
    var isInside = turf.inside(pt, poly.toGeoJSON());
    return isInside;
}


function drawHexagon(map,geohexCode){
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
    polygon.name='hexagon';
    map.addLayer(polygon);
    return polygon;
}

/**
* gets a random hexagon within a project
*/
function getRandomHexagon(project,geohexlevel){
    var isinside=false;
    var env = turf.envelope(project);
    var bbox = env.geometry.coordinates[0];

    while(!isinside){
        var lon_rnd = random(bbox[0][0], bbox[1][0]);
        var lat_rnd = random(bbox[0][1], bbox[2][1]);
        // check if point is inside polygon
        var pt = turf.point([lon_rnd, lat_rnd]);
        isinside = turf.inside(pt, project);
    }
    geohexcode = GEOHEX.getZoneByLocation(lat_rnd, lon_rnd, geohexlevel).code;
    return geohexcode;
}

function getSatelliteImageData(bbox, imagetype, callback) {
    var url = 'api/satelliteimages?bbox=' + bbox + '&imagetype=' + imagetype;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            callback(data);
        }
    };
    request.send();
}


function getHexagon(geohex, username, callback) {
    var url = 'api/hexagons/' + geohex + '?user=' + username;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            callback(data);
        }
    };
    request.send();
}


function loadJSON(file, callback) {   
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', file, true); // Replace 'my_data' with the path to your file
    request.onreadystatechange = function () {
          if (request.readyState == 4 && request.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(request.responseText);
          }
    };
    request.send(null);  
 }

 function postObservation(observation,user,geohexcode,callback) {
    var zone = GEOHEX.getZoneByCode(geohexcode);
    var obs = JSON.stringify({
        "user": user,
        "lat": zone.lat,
        "lon": zone.lon,
        "level": zone.getLevel(),
        "observation": observation,
        "geohex": geohexcode
    });
    var url = 'api/observations';
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader("Content-type", "application/json");
    saveObservation(obs);

    request.onload = function () {
        if (request.status == 201) {
            callback(request.responseText);
        }
    };
    request.send(obs);
}


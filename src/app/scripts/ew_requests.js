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
            var response = JSON.parse(request.responseText);
            callback(response);
        }
    };
    request.send(null);
}

function postObservation(observation, user, geohexcode, longitude, latitude, project, callback) {
    updateObservationStatistics(1);

    var zone = GEOHEX.getZoneByCode(geohexcode);
    var obs = JSON.stringify({
        "user": user,
        "lat": latitude,
        "lon": longitude,
        "level": zone.getLevel(),
        "observation": observation,
        "geohex": geohexcode,
        "project": project
    });
    var url = 'api/observations';
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader("Content-type", "application/json");

    request.onload = function () {
        if (request.status == 201) {
            var res = JSON.parse(request.responseText);
            callback(res);
        }
    };
    request.send(obs);
}

function updateObservationPosition(id, longitude, latitude, callback) {
    var body = JSON.stringify({
        "id": id,
        "lat": latitude,
        "lon": longitude
    });
    var url = 'api/observations';
    var request = new XMLHttpRequest();
    request.open('PUT', url, true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = function () {
        if (request.status == 200) {
            var res = JSON.parse(request.responseText);
            callback(res);
        }
    };
    request.send(body);
}

function deleteObservation(id, callback) {
    updateObservationStatistics(-1);

    var url = 'api/observations/' + id;
    var request = new XMLHttpRequest();
    request.open('DELETE', url, true);

    request.onload = function () {
        if (request.status == 200) {
            //var res = JSON.parse(request.responseText);
            callback(null);
        }
    };
    request.send(null);
}
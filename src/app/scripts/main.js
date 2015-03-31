/*jslint browser: true*/
/*global L */
/*global GEOHEX */
var geohexcode = null;
var startZoomlevel = 12;
var localStoragePrefix = 'EW_'; // earthWatchers
var user = localStorage.getItem(localStoragePrefix + 'user') || 'anonymous' ;
var satelliteImages = null;
var map = null;
var polygon = null;
var default_geohex_level = 7;
var defaultSatelliteType = 'Landsat';
var uservote = null;

function getSatelliteImageByDate(date) {
    for (var i = 0; i < satelliteImages.features.length; i++) {
        if (satelliteImages.features[i].properties.Published === date) {
            return satelliteImages.features[i];
        }
    }
    return null;
}

function findEarthWatchersLayer() {
    var result = null;
    map.eachLayer(function (layer) {
        if (layer.options.type !== null) {
            if (layer.options.type === 'earthWatchers') {
                result = layer;
            }
        }
    });
    return result;
}

function saveCleanedObservation(observationString) {
    // logging user actions
    //
    // create new line in localStorage like
    // { ...,
    //      'EW_1427635304381': '{"user":"barack","lat":1.0347919593425408,"lon":111.97073616826705,"level":7,"observation":"no","geohex":"PO5020737"}',
    //      ...}
    localStorage.setItem(
            localStoragePrefix + (new Date()).getTime(), observationString);
}

function sendObservation(observation) {
    if(observation!=uservote){
        colorizePolygon(observation);

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
        request.send(obs);
        saveCleanedObservation(obs);

        request.onload = function () {
            if (request.status == 201) {
    //            var data = JSON.parse(request.responseText);
                getHexagon(geohexcode, user, hexagonCallback);
            }
        };
    }
}

function getColorByObservation(observation) {
    var color = "#32cd32";
    if (observation === "yes") {
        color = "#b23618";
    } else if (observation === "maybe") {
        color = "#ffd900";
    }
    return color;
}

function colorizePolygon(observation) {
    var color = getColorByObservation(observation);
    polygon.setStyle({color: color});
}

function timeSliderChanged(ctrl) {
    var day = satelliteImages.features[ctrl.value].properties.Published;
    var label = document.getElementById('rangeValLabel');
    label.innerHTML = day;
    // update label positioning
    label.className = 'value' + ctrl.value;

    var earthWatchersLayer = findEarthWatchersLayer();

    var s = getSatelliteImageByDate(day);
    var url = s.properties.UrlTileCache + '/{z}/{x}/{y}.png';
    var maxlevel = s.properties.MaxLevel;
    var newLayer = L.tileLayer(url, {
        tms: true,
        maxZoom: maxlevel,
        type: 'earthWatchers'
    });
    map.addLayer(newLayer);

    if (earthWatchersLayer !== null) {
        map.removeLayer(earthWatchersLayer);
    }
}


function getGeohexPolygon(geohexcode, style) {
    var zone = GEOHEX.getZoneByCode(geohexcode);
    return L.polygon(zone.getHexCoords(), style);
}

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

function compare(a, b) {
    if (a.properties.Published < b.properties.Published) {
        return -1;
    }
    if (a.properties.Published > b.properties.Published) {
        return 1;
    }
    return 0;
}

function random(low, high) {
    return Math.random() * (high - low) + low;
}

function satelliteImagesCallback(req) {
    satelliteImages = req;
    var sel = document.getElementById('timeSlider');
    satelliteImages.features.sort(compare);
    sel.onchange();
}

function next() {
    var url = location.href.replace(location.hash,'');
    location.href=url;
}

function styleButton(button,checked){
    if(checked){
        button.style.border='5px solid black'
    }
    else{
        button.style.border='0px solid black'
    }
}

function hexagonCallback(req) {
    document.getElementById('btnYes').innerHTML = 'Yes (' + req.yes + ')';
    document.getElementById('btnNo').innerHTML = 'No (' + req.no + ')';
    document.getElementById('btnMaybe').innerHTML = 'Maybe (' + req.maybe + ')';

    uservote = req.uservote;
    styleButton (document.getElementById('btnYes'),uservote === 'yes');
    styleButton (document.getElementById('btnNo'),uservote === 'no');
    styleButton (document.getElementById('btnMaybe'),uservote === 'maybe');
}

function toggleSatelliteType(sel) {
    var labels = {
            Landsat: 'Landsat 8',
            Sentinel: 'Sentinel 1'
        },
        newtype = sel.value === 'Landsat' ? 'Sentinel' : 'Landsat';

    // change map layer
    satelliteTypeSelectionChanged({value: newtype});

    // update satellite type value
    sel.parentNode.classList.remove(sel.value.toLowerCase());
    sel.setAttribute('value', newtype);
    sel.parentNode.classList.add(sel.value.toLowerCase());

    // update satellite type label
    document.getElementById('satTypeLabel').innerText = labels[newtype];
}

function satelliteTypeSelectionChanged(sel) {
    var currentImageType = sel.value;
    var polygon = getGeohexPolygon(geohexcode);
    var bbox = polygon.getBounds().toBBoxString();
    getSatelliteImageData(bbox, currentImageType, satelliteImagesCallback);
}

function updateUsername(newName) {
    // update global var and localstorage value
    user = newName;
    localStorage.setItem(localStoragePrefix + 'user', newName);
}

function changeName(event) {
    var form = event.target,
        newName = form.children[0].value;

    // stop from saving empty name
    if (!newName) return false;

    updateUsername(newName);

    // clean and hide form
    form.parentElement.classList.add('hide');
    form.children[0].value = '';

    updateUserinfo();
    uservote=null;
    getHexagon(geohexcode, user, hexagonCallback);

    return false;
}

function showUserForm() {
    var userform = document.getElementById('userform');

    userform.classList.remove('hide');
}

function initUserpanel() {
    updateUserinfo();
    var userform = document.getElementById('userform');
    userform.children[0].onsubmit = changeName;
}

function updateUserinfo() {
    var userinfo = document.getElementById('userinfo');

    userinfo.innerHTML =
        '<span class="username"> Hi, ' + user + '!</span> ' +
        '<a class="userhint" onclick="showUserForm();">Change?</a>';
}


(function (window, document, L) {
    'use strict';
    L.Icon.Default.imagePath = 'images/';

    Path.map("#/hexagon/:hex").to(function(){
        // sample: #/hexagon/PO2670248
        geohexcode = this.params['hex'];
    });
    Path.listen();

    initUserpanel();

    var lon_min = 111.0;
    var lon_max = 112.0;
    var lat_min = 1;
    var lat_max = 2;

    if(geohexcode===null){
        var lon_rnd = random(lon_min, lon_max);
        var lat_rnd = random(lat_min, lat_max);
        geohexcode = GEOHEX.getZoneByLocation(lat_rnd, lon_rnd, default_geohex_level).code;
        location.hash = '#/hexagon/' + geohexcode;
    }

    // fire onchange event of first combobox
    satelliteTypeSelectionChanged({value: defaultSatelliteType});

    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    });

    var myStyle = {
        'color': '#000000',
        'weight': 5,
        'opacity': 0.65,
        fillOpacity: 0
    };
    getHexagon(geohexcode, user, hexagonCallback);

    polygon = getGeohexPolygon(geohexcode, myStyle);
    var centerHex = polygon.getBounds().getCenter();
    map.setView(centerHex, startZoomlevel, {
        animation: true
    });

    map.addControl(new L.Control.ZoomMin({
        position: 'topright', startLevel: startZoomlevel, startCenter: centerHex
    }));

    L.control.scale({imperial: false, position: 'topleft'}).addTo(map);

    var ggl2 = new L.Google('satellite');
    map.addLayer(ggl2);
    //omnivore.topojson('project.topojson').addTo(map);
    map.addLayer(polygon);
}(window, document, L));
